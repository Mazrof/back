class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code: number | undefined;
  path: string | undefined;
  value: string | undefined;
  // errors: [{ path: string }, message: string | undefined] | undefined;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
export { AppError };
