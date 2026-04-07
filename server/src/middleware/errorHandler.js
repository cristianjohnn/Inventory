/**
 * Global error handling middleware.
 * Catches all errors and returns a structured JSON response.
 */
export function errorHandler(err, req, res, _next) {
  // Log the error for debugging
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  // Prisma known request error (e.g. unique constraint violation)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${err.meta?.target?.join(', ') || 'field'} already exists.`,
      },
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred.'
          : err.message,
    },
  });
}
