namespace QueryAssistant.Api.Interfaces
{
    public interface ILLMService
    {
        Task<string> GenerateSqlAsync(string userPrompt, string systemPrompt);
    }
}