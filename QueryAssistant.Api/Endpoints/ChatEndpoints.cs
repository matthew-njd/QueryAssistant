using QueryAssistant.Api.Interfaces;
using QueryAssistant.Api.Services;
using QueryAssistant.Api.Models;

namespace QueryAssistant.Api.Endpoints
{
    public static class ChatEndpoints
    {
        public static void MapChatEndpoints(this WebApplication app)
        {
            app.MapPost("/api/chat", async (
            ChatRequest request,
            ILLMService llmService,
            PromptService promptService,
            QueryService queryService,
            SqlSafetyService sqlSafetyService) =>
            {
                if (string.IsNullOrWhiteSpace(request.Question))
                    return Results.BadRequest(new ChatResponse(false, null, null, null, null, "Question cannot be empty."));

                var systemPrompt = promptService.GetSystemPrompt();
                var sql = await llmService.GenerateSqlAsync(request.Question, systemPrompt);

                if (sql.Trim() == "CANNOT_GENERATE")
                    return Results.Ok(new ChatResponse(false, null, null, null, null, "I was unable to generate a query for that question. Please try rephrasing it."));

                if (!sqlSafetyService.IsSafe(sql))
                    return Results.Ok(new ChatResponse(false, null, null, null, null, "The generated query failed the safety check and was not executed."));

                var result = await queryService.ExecuteAsync(sql.Trim(), request.Page, request.PageSize);

                if (!result.Success)
                    return Results.Ok(new ChatResponse(false, sql.Trim(), null, null, null, result.Error));

                var pagination = new PaginationMeta(
                    request.Page,
                    request.PageSize,
                    result.TotalRows,
                    result.TotalPages);

                return Results.Ok(new ChatResponse(
                    true,
                    sql.Trim(),
                    result.Data,
                    result.Data?.Count,
                    pagination,
                    null));
            });
        }
    }
}