using System.Text;
using System.Text.Json;
using QueryAssistant.Api.Interfaces;
using QueryAssistant.Api.Models;

namespace QueryAssistant.Api.Services
{
    public class GeminiService : ILLMService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string ModelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini API key is not configured.");
        }

        public async Task<string> GenerateSqlAsync(string userPrompt, string systemPrompt)
        {
            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userPrompt } }
                    }
                }
            };

            return await CallGeminiAsync(payload);
        }

        public async Task<string> GenerateChatResponseAsync(List<ChatMessage> messages, string systemPrompt)
        {
            var contents = messages.Select(m => new
            {
                role = m.Role == "assistant" ? "model" : m.Role,
                parts = new[] { new { text = m.Content } }
            }).ToArray();

            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents
            };

            return await CallGeminiAsync(payload);
        }

        private async Task<string> CallGeminiAsync(object payload)
        {
            var url = $"{ModelUrl}?key={_apiKey}";
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);

            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);

            var generatedText = doc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return generatedText ?? throw new InvalidOperationException("Gemini returned an empty response.");
        }
    }
}