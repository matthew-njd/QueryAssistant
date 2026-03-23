namespace QueryAssistant.Api.Services
{
    public class SqlSafetyService
    {
        private static readonly string[] BlockedKeywords =
        [
            "INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE",
            "ALTER", "CREATE", "EXEC", "EXECUTE", "MERGE",
            "GRANT", "REVOKE", "BULK"
        ];

        public bool IsSafe(string sql)
        {
            if (string.IsNullOrWhiteSpace(sql))
                return false;

            var upperSql = sql.ToUpperInvariant();

            if (!upperSql.TrimStart().StartsWith("SELECT"))
                return false;

            foreach (var keyword in BlockedKeywords)
            {
                if (upperSql.Contains(keyword))
                    return false;
            }

            return true;
        }
    }
}