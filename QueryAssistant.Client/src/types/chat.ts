export interface ChatResponse {
  success: boolean;
  sql: string | null;
  data: Record<string, unknown>[] | null;
  rowCount: number | null;
  error: string | null;
}
