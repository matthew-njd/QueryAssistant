using QueryAssistant.Api.Models;

namespace QueryAssistant.Api.Interfaces
{
    public interface ILLMService
    {
        Task<string> GenerateSqlAsync(string userPrompt, string systemPrompt);
        Task<string> GenerateChatResponseAsync(List<ChatMessage> messages, string systemPrompt);
    }
}