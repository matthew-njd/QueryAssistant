import { useState } from "react";
import axios from "axios";
import type { ChatResponse } from "../types/chat";

export function useChat() {
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const ask = async (question: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCurrentQuestion(question);

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

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const { data, headers } = await axios.post(
        "/api/export",
        { question: currentQuestion },
        { responseType: "blob" },
      );

      const contentDisposition = headers["content-disposition"];
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1]
        : "export.xlsx";

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return { response, loading, exporting, error, ask, exportToExcel };
}
