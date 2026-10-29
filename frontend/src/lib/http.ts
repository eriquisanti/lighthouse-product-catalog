import { env } from '@/config/env';

type FieldError = {
  field: string;
  message: string;
};

type ErrorResponseBody = {
  message?: string;
  errors?: FieldError[];
};

type QueryParams = Record<string, string | number | undefined>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
};

const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
const UNEXPECTED_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';
const SERVER_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente mais tarde.';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];

  constructor(message: string, status: number, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

function buildUrl(path: string, query: QueryParams = {}): string {
  const url = new URL(`${env.apiUrl}${path}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function readErrorBody(response: Response): Promise<ErrorResponseBody> {
  try {
    return (await response.json()) as ErrorResponseBody;
  } catch {
    return {};
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function request<T>(
  path: string,
  { method = 'GET', body, query, signal }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  if (response.status >= 500) {
    throw new ApiError(SERVER_ERROR_MESSAGE, response.status);
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new ApiError(
      errorBody.message ?? UNEXPECTED_ERROR_MESSAGE,
      response.status,
      errorBody.errors ?? [],
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : UNEXPECTED_ERROR_MESSAGE;
}

export const http = {
  get: <T>(path: string, options?: Pick<RequestOptions, 'query' | 'signal'>) =>
    request<T>(path, options),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
