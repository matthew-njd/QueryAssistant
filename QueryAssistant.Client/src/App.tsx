import { QuestionInput } from "./components/QuestionInput";
import { ResultsTable } from "./components/ResultsTable";
import { useChat } from "./hooks/useChat";
import "./App.css";

function App() {
  const { response, loading, exporting, error, ask, exportToExcel } = useChat();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-primary">
            Sales Query Assistant
          </h1>
          <p className="text-base-content/60">
            Ask questions about your sales data in plain English
          </p>
        </div>

        {/* Input */}
        <div className="card bg-base-100 shadow p-6">
          <QuestionInput onSubmit={ask} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {response?.success && response.data && (
          <div className="card bg-base-100 shadow p-6">
            <ResultsTable
              data={response.data}
              sql={response.sql}
              totalRows={response.totalRows ?? 0}
              onExport={exportToExcel}
              exporting={exporting}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
