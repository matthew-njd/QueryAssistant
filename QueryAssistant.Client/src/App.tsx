import { useState } from "react";
import { ResultsTable } from "./components/ResultsTable";
import { BrainstormChat } from "./components/BrainstormChat";
import type { ChatResponse } from "./types/chat";
import "./App.css";

function App() {
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleReportGenerated = (chatResponse: ChatResponse, query: string) => {
    setResponse(chatResponse);
    setCurrentQuestion(query);
    setError(chatResponse.success ? null : (chatResponse.error ?? "An error occurred."));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-primary">
            PCF AI Query Assistant for Sales
          </h1>
        </div>

        <div className="bg-base-100 border-base-300 rounded-box border p-6">
          <BrainstormChat onReportGenerated={handleReportGenerated} />
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {response?.success && response.data && (
          <div className="bg-base-100 border-base-300 rounded-box border p-6">
            <ResultsTable
              data={response.data}
              sql={response.sql}
              totalRows={response.totalRows ?? 0}
              question={currentQuestion}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
