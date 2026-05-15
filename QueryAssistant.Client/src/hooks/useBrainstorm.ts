import { useState } from "react";
import axios from "axios";
import type { ChatMessage, BrainstormResponse, ChatResponse } from "../types/chat";

function extractSuggested(reply: string): string | null {
  const line = reply.split("\n").find((l) => l.trim().startsWith("SUGGESTED:"));
  return line ? line.replace("SUGGESTED:", "").trim() : null;
}

export function useBrainstorm() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuery, setSuggestedQuery] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);
    setSuggestedQuery(null);

    try {
      const { data } = await axios.post<BrainstormResponse>("/api/brainstorm", {
        messages: updatedMessages,
      });
      const assistantMessage: ChatMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestedQuery(extractSuggested(data.reply));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<ChatResponse>("/api/brainstorm/generate", {
        messages,
      });
      return data;
    } catch {
      setError("Failed to generate report. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestedQuery(null);
    setError(null);
  };

  return { messages, isLoading, error, suggestedQuery, sendMessage, generateReport, clearChat };
}
