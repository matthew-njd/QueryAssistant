export interface ChatResponse {
  success: boolean;
  sql: string | null;
  data: Record<string, unknown>[] | null;
  totalRows: number | null;
  error: string | null;
}
