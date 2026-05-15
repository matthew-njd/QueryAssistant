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
            PCF AI Query Assistant for Sales
          </h1>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-lift">
          <input
            type="radio"
            name="app_tabs"
            className="tab"
            aria-label="Quick Query"
            checked={activeTab === "quick"}
            onChange={() => setActiveTab("quick")}
          />
          {activeTab === "quick" && (
            <>
              <div className="tab-content bg-base-100 border-base-300 p-6">
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
                <div className="tab-content bg-base-100 border-base-300 p-6">
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

          <input
            type="radio"
            name="app_tabs"
            className="tab"
            aria-label="Brainstorm"
            checked={activeTab === "brainstorm"}
            onChange={() => setActiveTab("brainstorm")}
          />
          {activeTab === "brainstorm" && (
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <BrainstormChat
                onUseQuery={handleUseQuery}
                onReportGenerated={handleReportGenerated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
