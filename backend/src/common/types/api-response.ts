export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export function successResponse<T>(
  data: T,
  message = 'OK',
  meta?: ApiMeta,
): ApiSuccessResponse<T> {
  return meta
    ? { success: true, message, data, meta }
    : { success: true, message, data };
}

export function errorResponse(
  message: string,
  errors?: ApiFieldError[],
): ApiErrorResponse {
  return errors?.length
    ? { success: false, message, errors }
    : { success: false, message };
}
