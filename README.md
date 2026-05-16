# PCF AI Query Assistant for Sales

An AI-powered sales reporting tool that lets non-technical users generate reports from a SQL Server sales database using plain English. Instead of writing queries, users have a guided conversation with the AI to describe what they need. The AI asks clarifying questions, proposes a natural language report description, then translates it into SQL and returns the results.

---

## How It Works

The app uses a two-stage AI pipeline:

1. **Brainstorm (conversation)** — The user describes what report they need in plain English. The AI asks up to two clarifying questions at a time to pin down the time period, what to measure, and any filters. When it has enough information it proposes a `SUGGESTED` natural language query.

2. **Generate (SQL)** — When the user clicks Generate Report, the suggested query is sent to the LLM with the system prompt (schema + business rules) plus few-shot examples from previously successful queries. The generated SQL is safety-checked and executed against SQL Server. Results are displayed in a paginated table with an option to export to Excel.

Over time, successful queries are logged to `PCF_QueryAssistantAI_QueryLog` and injected back as few-shot examples, improving SQL generation accuracy on common report patterns.

---

## Project Structure

```
/QueryAssistant
  QueryAssistant.sln
  README.md
  /QueryAssistant.Api             ← ASP.NET Core Web API (.NET 10)
    /Endpoints
      BrainstormEndpoints.cs      ← POST /api/brainstorm and /api/brainstorm/generate
      HealthEndpoints.cs          ← GET /health
    /Interfaces
      ILLMService.cs              ← LLM provider abstraction
    /Models
      ChatModels.cs               ← Request/response records
    /Prompts
      system_prompt.txt           ← SQL generation rules, schema, and business logic
      brainstorm_prompt.txt       ← Conversational AI behavior and available data guide
    /Scripts
      CreateQueryLog.sql          ← One-time DDL to create the query log table
    /Services
      GeminiService.cs            ← Gemini (Google) LLM implementation
      PromptService.cs            ← Loads prompt files at startup
      QueryService.cs             ← Executes SQL via Dapper
      QueryLogService.cs          ← Logs successful queries, retrieves few-shot examples
      SqlSafetyService.cs         ← Validates generated SQL is SELECT-only
    Program.cs                    ← Entry point, DI registration, middleware
    appsettings.json              ← App configuration (no secrets)
  /QueryAssistant.Client          ← React + Vite + TypeScript frontend
    /src
      /components
        BrainstormChat.tsx        ← Conversational chat UI
        ResultsTable.tsx          ← Paginated results table with SQL preview and export
      /hooks
        useBrainstorm.ts          ← Brainstorm and report generation API logic
      /types
        chat.ts                   ← TypeScript types for API responses
      /utils
        exportToExcel.ts          ← Client-side Excel export utility
      App.tsx                     ← Root component and result state management
      main.tsx                    ← React entry point
    vite.config.ts                ← Vite config with API proxy
```

---

## Tech Stack

### API

| Package                  | Purpose                              |
| ------------------------ | ------------------------------------ |
| ASP.NET Core (.NET 10)   | Web API framework                    |
| Dapper                   | Lightweight SQL query execution      |
| Microsoft.Data.SqlClient | SQL Server database driver           |
| Scalar.AspNetCore        | API documentation UI (dev only)      |

### Client

| Package               | Purpose                      |
| --------------------- | ---------------------------- |
| React 18 + TypeScript | Frontend framework           |
| Vite                  | Build tool and dev server    |
| Tailwind CSS          | Utility-first CSS framework  |
| DaisyUI               | Tailwind component library   |
| Axios                 | HTTP client for API calls    |

---

## API Endpoints

| Method | Endpoint                    | Description                                                        |
| ------ | --------------------------- | ------------------------------------------------------------------ |
| GET    | `/health`                   | Health check                                                       |
| POST   | `/api/brainstorm`           | Multi-turn conversation — returns AI reply and optional SUGGESTED line |
| POST   | `/api/brainstorm/generate`  | Converts conversation/SUGGESTED query to SQL, executes, logs result |

---

## Database

The app connects to a SQL Server database containing sales and order data. The DB user is **read-only** on all sales tables. The `PCF_QueryAssistantAI_QueryLog` table is the only table the app writes to (INSERT and UPDATE), and requires explicit permission for the app user.

### Sales Tables

| Table            | Alias | Description                       |
| ---------------- | ----- | --------------------------------- |
| `ARCUSFIL_SQL`   | c     | Customer master records           |
| `ARALTADR_SQL`   | a     | Customer alternate addresses (Ship-Tos) |
| `OEHDRHST_SQL`   | h     | Sales order headers               |
| `OELINHST_SQL`   | l     | Sales order line items            |
| `ARSLMFIL_SQL`   | sr    | Sales representatives             |

### Query Log Table

| Table                           | Purpose                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `PCF_QueryAssistantAI_QueryLog` | Stores successful NL query + SQL pairs for few-shot injection |

To add new sales tables to the system, update `Prompts/system_prompt.txt` with the table name, alias, key columns, and any relevant join or filter rules.

---

## Security

- Secrets (API key, connection string) are stored via [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) locally
- The DB user has **read-only** access to all sales tables — the API never modifies sales data
- All generated SQL is validated by `SqlSafetyService` before execution — only `SELECT` statements are permitted
- The schema exposed to the AI is limited to sales and order tables only

---

## Roadmap

- [x] Brainstorm conversational UI
- [x] Query logging + few-shot injection for improved SQL accuracy
- [ ] Thumbs up/down feedback on results (to validate logged queries)
- [ ] AI natural language summary of report results
- [ ] Error correction loop (auto-retry with SQL error context on failure)
- [ ] Saved and named reports
- [ ] User authentication
- [ ] Production deployment guide
