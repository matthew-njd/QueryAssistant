import { useState } from "react";

interface Props {
  onSubmit: (question: string) => void;
  loading: boolean;
}

export function QuestionInput({ onSubmit, loading }: Props) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (question.trim()) onSubmit(question.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
        Ask a question about your sales data in plain English. The more specific
        the better!
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="e.g. Show me all orders that include item GEN2BK0 for our CVS customer, between Jan 2026 and March 2026."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Ask"
          )}
        </button>
      </div>
    </div>
  );
}
