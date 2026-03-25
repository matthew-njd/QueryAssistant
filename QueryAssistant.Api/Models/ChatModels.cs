namespace QueryAssistant.Api.Models
{
    public record ChatRequest(string Question, int Page = 1, int PageSize = 25);

    public record PaginationMeta(int Page, int PageSize, int TotalRows, int TotalPages);
    
    public record ChatResponse(
        bool Success,
        string? Sql,
        List<IDictionary<string, object?>>? Data,
        int? RowCount,
        PaginationMeta? Pagination,
        string? Error
    );
    
    public class ChatModels
    {
    }
}