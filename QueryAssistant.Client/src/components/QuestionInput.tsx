interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function QuestionInput({ value, onChange, onSubmit, loading }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
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
