namespace QueryAssistant.Api.Models
{
    public record ChatRequest(string Question);
    public record ChatResponse(
        bool Success,
        string? Sql,
        List<IDictionary<string, object?>>? Data,
        int? RowCount,
        string? Error
    );
    
    public class ChatModels
    {
    }
}