using ClosedXML.Excel;
using QueryAssistant.Api.Interfaces;
using QueryAssistant.Api.Models;
using QueryAssistant.Api.Services;

namespace QueryAssistant.Api.Endpoints
{
    public static class ExportEndpoints
    {
        public static void MapExportEndpoints(this WebApplication app)
        {
            app.MapPost("/api/export", async (
                ChatRequest request,
                ILLMService llmService,
                PromptService promptService,
                QueryService queryService,
                SqlSafetyService sqlSafetyService) =>
            {
                if (string.IsNullOrWhiteSpace(request.Question))
                    return Results.BadRequest("Question cannot be empty.");

                var systemPrompt = promptService.GetSystemPrompt();
                var sql = await llmService.GenerateSqlAsync(request.Question, systemPrompt);

                if (sql.Trim() == "CANNOT_GENERATE")
                    return Results.BadRequest("Unable to generate a query for that question.");

                if (!sqlSafetyService.IsSafe(sql))
                    return Results.BadRequest("The generated query failed the safety check.");

                var countResult = await queryService.ExecuteAsync(sql.Trim(), 1, 1);
                if (!countResult.Success)
                    return Results.BadRequest(countResult.Error ?? "Query execution failed.");

                var result = await queryService.ExecuteAsync(sql.Trim(), 1, countResult.TotalRows > 0 ? countResult.TotalRows : 1);

                if (!result.Success || result.Data == null || result.Data.Count == 0)
                    return Results.BadRequest(result.Error ?? "Query execution failed.");

                using var workbook = new XLWorkbook();
                AddSheet(workbook, "All Orders", result.Data);

                var firstRow = result.Data.FirstOrDefault();
                if (firstRow != null && firstRow.ContainsKey("cus_type_cd"))
                {
                    var grouped = result.Data
                        .GroupBy(row => row["cus_type_cd"]?.ToString()?.Trim() ?? "Unknown");

                    foreach (var group in grouped)
                    {
                        var sheetName = SanitizeSheetName(group.Key);
                        AddSheet(workbook, sheetName, group.ToList());
                    }
                }

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                stream.Position = 0;

                var fileName = $"orders_export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return Results.File(
                    stream.ToArray(),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            });
        }

        private static void AddSheet(XLWorkbook workbook, string sheetName, List<IDictionary<string, object?>> data)
        {
            var sheet = workbook.Worksheets.Add(sheetName);

            if (!data.Any()) return;

            var columns = data.First().Keys.ToList();
            for (int i = 0; i < columns.Count; i++)
            {
                var cell = sheet.Cell(1, i + 1);
                cell.Value = columns[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#2563EB");
                cell.Style.Font.FontColor = XLColor.White;
            }

            for (int rowIndex = 0; rowIndex < data.Count; rowIndex++)
            {
                var row = data[rowIndex];
                for (int colIndex = 0; colIndex < columns.Count; colIndex++)
                {
                    var value = row[columns[colIndex]];
                    var cell = sheet.Cell(rowIndex + 2, colIndex + 1);

                    cell.Value = value switch
                    {
                        null => XLCellValue.FromObject(""),
                        int i => i,
                        long l => l,
                        decimal d => d,
                        double db => db,
                        float f => f,
                        bool b => b,
                        _ => value.ToString() ?? ""
                    };

                    if (rowIndex % 2 == 1)
                        cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#F1F5F9");
                }
            }

            sheet.Columns().AdjustToContents();
        }

        private static string SanitizeSheetName(string name)
        {
            var invalid = new[] { ':', '\\', '/', '?', '*', '[', ']' };
            foreach (var c in invalid)
                name = name.Replace(c, '_');

            return name.Length > 31 ? name[..31] : name;
        }
    }
}