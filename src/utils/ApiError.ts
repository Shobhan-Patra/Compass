// Custom API error class for structured error handling.

class ApiError extends Error {
  public statusCode: number;
  public errors: string[];
  public success: boolean;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: string[] = [],
    stack: string = '',
  ) {
    super(message); // Call the base Error constructor

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // If stack is provided use it; otherwise capture the current stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
