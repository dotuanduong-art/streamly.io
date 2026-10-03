// Matches ASP.NET ProblemDetails format
export interface ApiError {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
