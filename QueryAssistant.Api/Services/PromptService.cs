namespace QueryAssistant.Api.Services
{
    public class PromptService
    {
        private readonly string _systemPrompt;

        public PromptService(IWebHostEnvironment env)
        {
            var path = Path.Combine(env.ContentRootPath, "Prompts", "system_prompt.txt");
            _systemPrompt = File.ReadAllText(path);
        }

        public string GetSystemPrompt() => _systemPrompt;
    }
}