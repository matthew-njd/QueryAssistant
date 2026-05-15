import { useState, useRef, useEffect } from "react";
import { useBrainstorm } from "../hooks/useBrainstorm";
import type { ChatResponse } from "../types/chat";

function stripSuggested(text: string): string {
  return text
    .split("\n")
    .filter((l) => !l.trim().startsWith("SUGGESTED:"))
    .join("\n")
    .trim();
}

interface Props {
  onUseQuery: (query: string) => void;
  onReportGenerated: (response: ChatResponse, query: string) => void;
}

export function BrainstormChat({ onUseQuery, onReportGenerated }: Props) {
  const {
    messages,
    isLoading,
    error,
    suggestedQuery,
    sendMessage,
    generateReport,
    clearChat,
  } = useBrainstorm();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleGenerateReport = async () => {
    const result = await generateReport();
    if (result)
      onReportGenerated(result, suggestedQuery ?? "Brainstorm report");
  };

  return (
    <div className="flex flex-col h-130">
      {/* Clear button */}
      {messages.length > 0 && (
        <div className="flex justify-end pb-2">
          <button className="btn btn-ghost btn-xs" onClick={clearChat}>
            Clear conversation
          </button>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center py-16">
            <p className="text-base-content/40 text-sm">
              Describe the report you need and I'll help you refine it.
              <br />
              For example: "I want to see sales data for Canada this year."
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div
              className={`chat-bubble text-sm whitespace-pre-wrap ${
                msg.role === "user" ? "chat-bubble-primary" : ""
              }`}
            >
              {msg.role === "assistant"
                ? stripSuggested(msg.content)
                : msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-bubble">
              <span className="loading loading-dots loading-sm" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error py-2 text-sm mt-2">
          <span>{error}</span>
        </div>
      )}

      {/* Suggested query card */}
      {suggestedQuery && (
        <div className="mt-3 p-3 bg-base-200 rounded-xl border border-primary/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-1">
            Suggested query
          </p>
          <p className="text-sm italic mb-3">"{suggestedQuery}"</p>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => onUseQuery(suggestedQuery)}
            >
              Use this query
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Generate Report"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="pt-3 border-t border-base-300 mt-3">
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="Describe what you're looking for..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
