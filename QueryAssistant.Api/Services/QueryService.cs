using Dapper;
using Microsoft.Data.SqlClient;

namespace QueryAssistant.Api.Services
{
    public class QueryService
    {
        private readonly string _connectionString;

        public QueryService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string is not configured.");
        }

        public async Task<QueryResult> ExecuteAsync(string sql)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                var rows = await connection.QueryAsync(sql);
                var data = rows.Select(row => (IDictionary<string, object?>)row).ToList();

                return new QueryResult(true, data, data.Count, null);
            }
            catch (Exception ex)
            {
                return new QueryResult(false, null, 0, ex.Message);
            }
        }
    }
}

public record QueryResult(
    bool Success,
    List<IDictionary<string, object?>>? Data,
    int TotalRows,
    string? Error
);