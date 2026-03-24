# Query Assistant

A natural language sales data query tool built with ASP.NET Core (.NET 10) and React (Vite + TypeScript). Users can ask plain English questions about sales and order data, which are translated into SQL queries using an AI language model and executed against a SQL Server database. Results are displayed in a data table with an option to export to Excel.

---

## Project Structure

```
/QueryAssistant
  QueryAssistant.sln
  README.md
  /QueryAssistant.API          ← ASP.NET Core Web API (.NET 10)
    /Endpoints
      ChatEndpoints.cs         ← POST /api/chat — natural language to SQL + execution
      ExportEndpoints.cs       ← POST /api/export — generate and download Excel file
      HealthEndpoints.cs       ← GET /health — API health check
    /Interfaces
      ILLMService.cs           ← LLM provider abstraction interface
    /Models
      ChatModels.cs            ← Request and response models
    /Prompts
      system_prompt.txt        ← AI system prompt containing schema and rules
    /Services
      ClaudeService.cs         ← Claude (Anthropic) LLM implementation
      GeminiService.cs         ← Gemini (Google) LLM implementation
      PromptService.cs         ← Loads and serves the system prompt
      QueryService.cs          ← Executes SQL queries via Dapper
      SqlSafetyService.cs      ← Validates generated SQL is read-only
    Program.cs                 ← App entry point, DI registration, middleware
    appsettings.json           ← App configuration (no secrets)
  /QueryAssistant.Client       ← React + Vite + TypeScript frontend
    /src
      /components
        QuestionInput.tsx      ← Natural language input bar
        ResultsTable.tsx       ← Dynamic results table with export button
      /hooks
        useChat.ts             ← API call logic for chat and export
      /types
        chat.ts                ← TypeScript types for API responses
      App.tsx                  ← Root application component
      main.tsx                 ← React entry point
      index.css                ← Tailwind CSS imports
    vite.config.ts             ← Vite config with API proxy
    tailwind.config.js         ← Tailwind + DaisyUI configuration
```

---

## Tech Stack

### API

| Package                  | Purpose                         |
| ------------------------ | ------------------------------- |
| ASP.NET Core (.NET 10)   | Web API framework               |
| Dapper                   | Lightweight SQL query execution |
| Microsoft.Data.SqlClient | SQL Server database driver      |
| ClosedXML                | Excel file generation           |
| Anthropic.SDK            | Claude AI provider (optional)   |
| Scalar.AspNetCore        | API documentation UI            |

### Client

| Package               | Purpose                     |
| --------------------- | --------------------------- |
| React 18 + TypeScript | Frontend framework          |
| Vite                  | Build tool and dev server   |
| Tailwind CSS          | Utility-first CSS framework |
| DaisyUI               | Tailwind component library  |
| Axios                 | HTTP client for API calls   |

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- SQL Server instance (local or hosted)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com) or a Claude API key from [Anthropic](https://console.anthropic.com)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/QueryAssistant.git
cd QueryAssistant
```

### 2. Configure API secrets

Navigate to the API project and initialise user secrets:

```bash
cd QueryAssistant.API
dotnet user-secrets init
```

Set your API key and database connection string:

```bash
# If using Gemini
dotnet user-secrets set "Gemini:ApiKey" "your-gemini-api-key"

# If using Claude
dotnet user-secrets set "Claude:ApiKey" "your-claude-api-key"

# Database connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=your-server;Database=your-db;User Id=your-user;Password=your-password;Encrypt=True;TrustServerCertificate=True"
```

### 3. Run the API

```bash
cd QueryAssistant.API
dotnet run
```

The API will be available at `http://localhost:5000`.
Scalar API docs will be available at `http://localhost:5000/scalar`.

### 4. Run the React client

Open a second terminal:

```bash
cd QueryAssistant.Client
npm install
npm run dev
```

The client will be available at `http://localhost:5173`.

---

## Switching LLM Providers

The project uses an `ILLMService` abstraction so switching between Gemini and Claude requires a one-line change in `Program.cs`:

```csharp
// Active LLM provider — swap comment to switch providers
builder.Services.AddHttpClient<ILLMService, GeminiService>();
// builder.Services.AddScoped<ILLMService, ClaudeService>();
```

---

## API Endpoints

| Method | Endpoint      | Description                                                                  |
| ------ | ------------- | ---------------------------------------------------------------------------- |
| GET    | `/health`     | Health check — confirms API is running                                       |
| POST   | `/api/chat`   | Accepts a natural language question, returns generated SQL and query results |
| POST   | `/api/export` | Accepts a natural language question, returns a downloadable Excel file       |

### POST /api/chat

**Request:**

```json
{
  "question": "Show me all orders that include item GEN2BK0"
}
```

**Response:**

```json
{
  "success": true,
  "sql": "SELECT ...",
  "data": [...],
  "rowCount": 42,
  "error": null
}
```

### POST /api/export

**Request:**

```json
{
  "question": "Show me all orders that include item GEN2BK0"
}
```

**Response:** A downloadable `.xlsx` file with a main sheet and additional sheets grouped by `cus_type_cd` if present in the results.

---

## Database Schema

The system prompt in `Prompts/system_prompt.txt` covers the following tables:

| Table          | Alias | Description                  |
| -------------- | ----- | ---------------------------- |
| `ARCUSFIL_SQL` | c     | Customer master records      |
| `ARALTADR_SQL` | a     | Customer alternate addresses |
| `OEHDRHST_SQL` | h     | Sales order headers          |
| `OELINHST_SQL` | l     | Sales order line items       |
| `ARSLMFIL_SQL` | sr    | Sales representatives        |

To add new tables, update `system_prompt.txt` with the table name, alias, key columns and any relevant join or filter examples.

---

## Security

- All secrets are stored using [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) locally and should be stored in environment variables or a secrets manager in production
- The database connection should use a **read-only SQL user** — the API never writes to the database
- All generated SQL is validated by `SqlSafetyService` before execution — only `SELECT` statements are permitted
- The schema exposed to the AI is limited to sales and order tables only

---

## Roadmap

- [ ] Milestone 7 — POC hardening and pre-demo polish
- [ ] Conversation history (multi-turn questions)
- [ ] Query result pagination for large datasets
- [ ] User authentication
- [ ] Logging and query audit trail
- [ ] Production deployment guide

---

## License

This project is for internal use only.
