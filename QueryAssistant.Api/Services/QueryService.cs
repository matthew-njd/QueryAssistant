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

        public async Task<QueryResult> ExecuteAsync(string sql, int page, int pageSize)
        {
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                var countSql = $"SELECT COUNT(*) FROM ({sql}) AS _countQuery";
                var totalRows = await connection.ExecuteScalarAsync<int>(countSql);

                var paginatedSql = $"""
                        {sql}
                        ORDER BY (SELECT NULL)
                        OFFSET {(page - 1) * pageSize} ROWS
                        FETCH NEXT {pageSize} ROWS ONLY
                    """;

                var rows = await connection.QueryAsync(paginatedSql);
                var data = rows.Select(row => (IDictionary<string, object?>)row).ToList();

                var totalPages = (int)Math.Ceiling((double)totalRows / pageSize);

                return new QueryResult(true, data, totalRows, totalPages, null);
            }
            catch (Exception ex)
            {
                return new QueryResult(false, null, 0, 0, ex.Message);
            }
        }
    }
}

public record QueryResult(
    bool Success,
    List<IDictionary<string, object?>>? Data,
    int TotalRows,
    int TotalPages,
    string? Error);