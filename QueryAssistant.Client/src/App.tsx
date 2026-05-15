import { useState } from "react";
import { QuestionInput } from "./components/QuestionInput";
import { ResultsTable } from "./components/ResultsTable";
import { BrainstormChat } from "./components/BrainstormChat";
import { useChat } from "./hooks/useChat";
import type { ChatResponse } from "./types/chat";
import "./App.css";

type Tab = "quick" | "brainstorm";

function App() {
  const { response, loading, error, ask, overrideResponse } = useChat();
  const [question, setQuestion] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("quick");

  const handleAsk = () => {
    if (!question.trim()) return;
    setCurrentQuestion(question.trim());
    ask(question.trim());
  };

  const handleUseQuery = (query: string) => {
    setQuestion(query);
    setActiveTab("quick");
  };

  const handleReportGenerated = (chatResponse: ChatResponse, query: string) => {
    overrideResponse(chatResponse);
    setCurrentQuestion(query);
    setActiveTab("quick");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-primary">
            PCF Sales Query Assistant
          </h1>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-bordered">
          <button
            role="tab"
            className={`tab ${activeTab === "quick" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("quick")}
          >
            Quick Query
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === "brainstorm" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("brainstorm")}
          >
            Brainstorm
          </button>
        </div>

        {/* Quick Query Tab */}
        {activeTab === "quick" && (
          <>
            <div className="card bg-base-100 shadow p-6">
              <QuestionInput
                value={question}
                onChange={setQuestion}
                onSubmit={handleAsk}
                loading={loading}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            {response?.success && response.data && (
              <div className="card bg-base-100 shadow p-6">
                <ResultsTable
                  data={response.data}
                  sql={response.sql}
                  totalRows={response.totalRows ?? 0}
                  question={currentQuestion}
                />
              </div>
            )}
          </>
        )}

        {/* Brainstorm Tab */}
        {activeTab === "brainstorm" && (
          <div className="card bg-base-100 shadow p-6">
            <BrainstormChat
              onUseQuery={handleUseQuery}
              onReportGenerated={handleReportGenerated}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
