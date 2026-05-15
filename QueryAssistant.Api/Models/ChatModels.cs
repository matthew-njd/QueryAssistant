namespace QueryAssistant.Api.Models
{
    public record ChatRequest(string Question);

    public record ChatResponse(
        bool Success,
        string? Sql,
        List<IDictionary<string, object?>>? Data,
        int? TotalRows,
        string? Error
    );

    public record ChatMessage(string Role, string Content);

    public record BrainstormRequest(List<ChatMessage> Messages);

    public record BrainstormResponse(string Reply);
}