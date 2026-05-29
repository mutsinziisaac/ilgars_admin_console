import axios from "axios";
import type { ApiErrorShape } from "./types";

type ApiErrorOptions = Partial<ApiErrorShape> & {
  cause?: unknown;
};

export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;
  public fieldErrors?: Record<string, string[]>;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.fieldErrors = options.fieldErrors;
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export class NetworkError extends ApiError {
  constructor(
    message = "Unable to reach the server",
    options: ApiErrorOptions = {},
  ) {
    super(message, { ...options, status: options.status ?? 0 });
    this.name = "NetworkError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, options);
    this.name = "ValidationError";
  }
}

// Type for server response structure
interface ServerErrorResponse {
  header?: {
    operation?: string;
    request_uri?: string;
    response_code?: number;
    response_message?: string;
    additional_details?: string;
  };
  data?: unknown;
  validation_errors?: Array<{
    field?: string;
    message?: string;
  }>;
}

const buildValidationErrorMessage = (
  baseMessage: string | undefined,
  validationErrors: ServerErrorResponse["validation_errors"],
): string | undefined => {
  if (!validationErrors?.length) {
    return baseMessage;
  }

  const first = validationErrors[0];
  const field = first?.field?.trim();
  const message = first?.message?.trim();
  const detail = [field, message].filter(Boolean).join(" - ");

  if (!detail) {
    return baseMessage;
  }

  return baseMessage ? `${baseMessage}: ${detail}` : detail;
};

const buildFieldErrors = (
  validationErrors: ServerErrorResponse["validation_errors"],
): Record<string, string[]> | undefined => {
  if (!validationErrors?.length) {
    return undefined;
  }

  return validationErrors.reduce<Record<string, string[]>>((acc, error) => {
    const field = error?.field?.trim();
    const message = error?.message?.trim();
    if (!field || !message) {
      return acc;
    }
    acc[field] = acc[field] ? [...acc[field], message] : [message];
    return acc;
  }, {});
};

const getStringRecordValue = (
  value: unknown,
  key: string,
): unknown => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
};

const getServerErrorDetail = (details: unknown): string | undefined => {
  if (!details || typeof details !== "object") {
    return undefined;
  }

  const header = getStringRecordValue(details, "header");
  const headerMessage = getStringRecordValue(header, "response_message");
  if (typeof headerMessage === "string" && headerMessage.trim()) {
    return headerMessage.trim();
  }

  const additionalDetails = getStringRecordValue(header, "additional_details");
  if (typeof additionalDetails === "string" && additionalDetails.trim()) {
    return additionalDetails.trim();
  }

  const message = getStringRecordValue(details, "message");
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  const error = getStringRecordValue(details, "error");
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  const errorMessage = getStringRecordValue(error, "message");
  if (typeof errorMessage === "string" && errorMessage.trim()) {
    return errorMessage.trim();
  }

  const validationErrors = getStringRecordValue(details, "validation_errors");
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    const first = validationErrors[0] as Record<string, unknown> | undefined;
    const field = typeof first?.field === "string" ? first.field.trim() : "";
    const validationMessage = typeof first?.message === "string" ? first.message.trim() : "";
    const detail = [field, validationMessage].filter(Boolean).join(" - ");

    return detail || undefined;
  }

  return undefined;
};

const technicalMessagePatterns = [
  /jakarta/i,
  /exception/i,
  /stack trace/i,
  /request body must/i,
  /json parse/i,
  /cannot deserialize/i,
  /constraint/i,
  /null value/i,
  /sql/i,
  /hibernate/i,
];

const isTechnicalMessage = (message: string) =>
  technicalMessagePatterns.some((pattern) => pattern.test(message));

const sentenceCase = (message: string) => {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const humanizeKnownBackendMessage = (message: string): string | undefined => {
  const normalized = message.trim();

  if (/paymentReference is required/i.test(normalized)) {
    return "Enter the payment reference before issuing this permit.";
  }

  if (/request body must be wrapped/i.test(normalized)) {
    return "The app could not send this request in the format the server expects. Refresh and try again.";
  }

  const missingRoadClosureRate = normalized.match(
    /Create an active road closure rate for municipality ([^,]+), charge type ([^,]+), purpose ([^,]+), and road type ([^ ]+)/i,
  );
  if (missingRoadClosureRate) {
    const [, municipalityId, , purpose, roadType] = missingRoadClosureRate;
    const displayPurpose = purpose.replace(/_/g, " ").toLowerCase();
    const displayRoadType = roadType.replace(/_/g, " ").toLowerCase();

    return `A matching active road closure rate is missing for ${displayPurpose} on ${displayRoadType}. Create or activate it for municipality ${municipalityId}, then try again.`;
  }

  if (/duplicate key value violates unique constraint/i.test(normalized)) {
    const match = normalized.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists/);
    if (match) {
      const fields = match[1].replace(/_/g, " ").replace(/,/g, " and ");
      return `A record with this ${fields} already exists.`;
    }
    return "A record with these details already exists.";
  }

  return undefined;
};

const getStatusFallbackMessage = (
  status: number | undefined,
  defaultMessage: string,
) => {
  switch (status) {
    case 0:
      return "The server could not be reached. Check your connection and try again.";
    case 400:
      return "Some information is missing or invalid. Check the form and try again.";
    case 401:
      return "Your session has expired. Sign in again to continue.";
    case 403:
      return "You do not have permission to perform this action. Ask an administrator to update your role if you need access.";
    case 404:
      return "This record could not be found. It may have been removed or changed by someone else.";
    case 409:
      return "This action cannot be completed because the record is not in the right state. Refresh the page and try again.";
    case 422:
      return "The server could not accept the submitted details. Check the required fields and try again.";
    case 429:
      return "Too many requests were sent. Wait a moment, then try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "The server had a problem completing this request. Try again in a moment.";
    default:
      return defaultMessage;
  }
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data;

    const serverError = responseData as ServerErrorResponse | undefined;
    const legacyPayload = responseData as ApiErrorShape | undefined;

    if (!status) {
      return new NetworkError(error.message, { cause: error });
    }

    const validationErrors = serverError?.validation_errors;

    const baseMessage =
      serverError?.header?.response_message ||
      legacyPayload?.message ||
      error.message;
    const errorMessage = buildValidationErrorMessage(
      baseMessage,
      validationErrors,
    );

    const errorCode = legacyPayload?.code;

    const fieldErrors =
      buildFieldErrors(validationErrors) ?? legacyPayload?.fieldErrors;

    if (status === 422 || (validationErrors && validationErrors.length > 0)) {
      return new ValidationError(errorMessage ?? "Validation error", {
        status,
        code: errorCode,
        details: validationErrors?.length
          ? responseData
          : (serverError?.header?.additional_details ??
            legacyPayload?.details ??
            responseData),
        fieldErrors,
        cause: error,
      });
    }

    return new ApiError(errorMessage ?? "Request failed", {
      status: serverError?.header?.response_code ?? status,
      code: errorCode,
      details: validationErrors?.length
        ? responseData
        : (serverError?.header?.additional_details ??
          legacyPayload?.details ??
          responseData),
      fieldErrors,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message, { cause: error });
  }

  return new ApiError("Unknown error", { details: error });
};

export const getApiErrorMessage = (
  error: unknown,
  defaultMessage = "An unexpected error occurred. Please try again.",
): string => {
  const apiError = toApiError(error);
  const serverDetail = getServerErrorDetail(apiError.details);
  const statusFallback = getStatusFallbackMessage(apiError.status, defaultMessage);

  if (apiError.status === 401 || apiError.status === 403) {
    return statusFallback;
  }

  if (serverDetail) {
    const knownMessage = humanizeKnownBackendMessage(serverDetail);
    if (knownMessage) return knownMessage;

    if (!isTechnicalMessage(serverDetail)) {
      return sentenceCase(serverDetail);
    }

    return statusFallback;
  }

  if (apiError.message && apiError.message !== "Request failed") {
    const message = apiError.message;
    const knownMessage = humanizeKnownBackendMessage(message);
    if (knownMessage) return knownMessage;

    if (message.includes("duplicate key value violates unique constraint")) {
      const match = message.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists/);
      if (match) {
        const fields = match[1].replace(/_/g, " ").replace(/,/g, " and ");
        return `A record with this ${fields} already exists.`;
      }
      return "A record with these details already exists.";
    }

    if (!isTechnicalMessage(message)) {
      const errorBodyMatch = message.match(/Error\s*:\s*(.+)$/s);
      if (errorBodyMatch) {
        const extracted = errorBodyMatch[1].trim();
        const knownExtractedMessage = humanizeKnownBackendMessage(extracted);
        if (knownExtractedMessage) return knownExtractedMessage;
        return isTechnicalMessage(extracted) ? statusFallback : sentenceCase(extracted);
      }
      return sentenceCase(message);
    }

    const errorCodeMatch = message.match(/Error code: ([A-Z0-9-]+)/);
    if (errorCodeMatch) {
      return `Operation failed (${errorCodeMatch[1]}). Please try again or contact support.`;
    }
  }

  if (typeof apiError.details === "string" && apiError.details) {
    const details = apiError.details;
    const errorBodyMatch = details.match(/Error\s*:\s*(.+)$/s);
    if (errorBodyMatch) {
      const extracted = errorBodyMatch[1].trim();
      const knownExtractedMessage = humanizeKnownBackendMessage(extracted);
      if (knownExtractedMessage) return knownExtractedMessage;
      if (!isTechnicalMessage(extracted)) return sentenceCase(extracted);
    }
    if (details.includes("duplicate key")) {
      return "A record with these details already exists.";
    }
  }

  return statusFallback;
};
