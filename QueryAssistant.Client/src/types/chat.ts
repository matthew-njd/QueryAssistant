export interface ChatResponse {
  success: boolean;
  sql: string | null;
  data: Record<string, unknown>[] | null;
  totalRows: number | null;
  error: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BrainstormResponse {
  reply: string;
}
