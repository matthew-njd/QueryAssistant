import { useState } from "react";
import axios from "axios";
import type { ChatResponse } from "../types/chat";

export function useChat() {
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const { data } = await axios.post<ChatResponse>("/api/chat", {
        question,
      });
      setResponse(data);
      if (!data.success) setError(data.error);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, ask };
}
