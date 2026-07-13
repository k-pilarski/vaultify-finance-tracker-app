export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
}
