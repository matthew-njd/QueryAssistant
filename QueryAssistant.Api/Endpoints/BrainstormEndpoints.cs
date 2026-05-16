using QueryAssistant.Api.Interfaces;
using QueryAssistant.Api.Models;
using QueryAssistant.Api.Services;

namespace QueryAssistant.Api.Endpoints
{
    public static class BrainstormEndpoints
    {
        public static void MapBrainstormEndpoints(this WebApplication app)
        {
            app.MapPost("/api/brainstorm", async (
                BrainstormRequest request,
                ILLMService llmService,
                PromptService promptService) =>
            {
                if (request.Messages is null || request.Messages.Count == 0)
                    return Results.BadRequest(new BrainstormResponse("Messages cannot be empty."));

                var brainstormPrompt = promptService.GetBrainstormPrompt();
                var reply = await llmService.GenerateChatResponseAsync(request.Messages, brainstormPrompt);

                return Results.Ok(new BrainstormResponse(reply));
            });

            app.MapPost("/api/brainstorm/generate", async (
                BrainstormRequest request,
                ILLMService llmService,
                PromptService promptService,
                QueryService queryService,
                QueryLogService queryLogService,
                SqlSafetyService sqlSafetyService) =>
            {
                if (request.Messages is null || request.Messages.Count == 0)
                    return Results.BadRequest(new ChatResponse(false, null, null, null, "Messages cannot be empty."));

                var suggestedLine = request.Messages
                    .Where(m => m.Role == "assistant")
                    .SelectMany(m => m.Content.Split('\n'))
                    .LastOrDefault(l => l.Trim().StartsWith("SUGGESTED:"));

                string metaPrompt;
                string? suggestedQuery = null;

                if (!string.IsNullOrEmpty(suggestedLine))
                {
                    suggestedQuery = suggestedLine.Replace("SUGGESTED:", "").Trim();
                    metaPrompt = $"Generate a SQL query for the following report request: {suggestedQuery}";
                }
                else
                {
                    var conversationText = string.Join("\n", request.Messages.Select(m =>
                        $"{(m.Role == "user" ? "User" : "Assistant")}: {m.Content}"));
                    metaPrompt = $"""
                        The following is a conversation where a user described the report they need:

                        {conversationText}

                        Based on this conversation, generate the SQL query that retrieves the data the user described.
                        """;
                }

                var systemPrompt = promptService.GetSystemPrompt();
                var examples = await queryLogService.GetTopExamplesAsync(5);
                var enrichedSystemPrompt = examples.Count > 0
                    ? systemPrompt + BuildFewShotBlock(examples)
                    : systemPrompt;

                var sql = await llmService.GenerateSqlAsync(metaPrompt, enrichedSystemPrompt);

                if (sql.Trim() == "CANNOT_GENERATE" || sql.Trim().Contains("Please reword"))
                    return Results.Ok(new ChatResponse(false, null, null, null, "Could not generate a query from the conversation. Try rephrasing what you need."));

                if (!sqlSafetyService.IsSafe(sql))
                    return Results.Ok(new ChatResponse(false, null, null, null, "The generated query failed the safety check and was not executed."));

                var result = await queryService.ExecuteAsync(sql.Trim());

                if (!result.Success)
                    return Results.Ok(new ChatResponse(false, sql.Trim(), null, null, result.Error));

                if (suggestedQuery is not null)
                    await queryLogService.LogQueryAsync(suggestedQuery, sql.Trim());

                return Results.Ok(new ChatResponse(true, sql.Trim(), result.Data, result.TotalRows, null));
            });
        }

        private static string BuildFewShotBlock(List<QueryExample> examples)
        {
            var lines = new System.Text.StringBuilder();
            lines.AppendLine();
            lines.AppendLine();
            lines.AppendLine("EXAMPLE QUERIES (proven queries from this system — use as reference for accuracy):");

            for (int i = 0; i < examples.Count; i++)
            {
                lines.AppendLine();
                lines.AppendLine($"Example {i + 1}:");
                lines.AppendLine($"Request: {examples[i].NLQuery}");
                lines.AppendLine("SQL:");
                lines.AppendLine(examples[i].GeneratedSql);
            }

            return lines.ToString();
        }
    }
}
