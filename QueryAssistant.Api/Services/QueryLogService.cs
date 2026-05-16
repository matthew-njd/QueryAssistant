using Dapper;
using Microsoft.Data.SqlClient;
using QueryAssistant.Api.Models;

namespace QueryAssistant.Api.Services
{
    public class QueryLogService
    {
        private readonly string _connectionString;

        public QueryLogService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string is not configured.");
        }

        public async Task LogQueryAsync(string nlQuery, string sql)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                var existing = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM PCF_QueryAssistantAI_QueryLog WHERE NLQuery = @NLQuery",
                    new { NLQuery = nlQuery });

                if (existing > 0)
                {
                    await connection.ExecuteAsync(
                        "UPDATE PCF_QueryAssistantAI_QueryLog SET UsageCount = UsageCount + 1, LastUsedAt = GETDATE() WHERE NLQuery = @NLQuery",
                        new { NLQuery = nlQuery });
                }
                else
                {
                    await connection.ExecuteAsync(
                        "INSERT INTO PCF_QueryAssistantAI_QueryLog (NLQuery, GeneratedSql) VALUES (@NLQuery, @GeneratedSql)",
                        new { NLQuery = nlQuery, GeneratedSql = sql });
                }
            }
            catch
            {
                // Logging must never break report generation
            }
        }

        public async Task<List<QueryExample>> GetTopExamplesAsync(int count = 5)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                var rows = await connection.QueryAsync<QueryExample>(
                    "SELECT TOP (@Count) NLQuery, GeneratedSql, UsageCount FROM PCF_QueryAssistantAI_QueryLog ORDER BY UsageCount DESC",
                    new { Count = count });

                return rows.ToList();
            }
            catch
            {
                return [];
            }
        }
    }
}
