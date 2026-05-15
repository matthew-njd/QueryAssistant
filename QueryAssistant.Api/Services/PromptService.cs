namespace QueryAssistant.Api.Services
{
    public class PromptService
    {
        private readonly string _systemPrompt;
        private readonly string _brainstormPrompt;

        public PromptService(IWebHostEnvironment env)
        {
            var promptsPath = Path.Combine(env.ContentRootPath, "Prompts");
            _systemPrompt = File.ReadAllText(Path.Combine(promptsPath, "system_prompt.txt"));
            _brainstormPrompt = File.ReadAllText(Path.Combine(promptsPath, "brainstorm_prompt.txt"));
        }

        public string GetSystemPrompt() => _systemPrompt;
        public string GetBrainstormPrompt() => _brainstormPrompt;
    }
}