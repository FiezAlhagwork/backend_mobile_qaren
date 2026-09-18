class AppError extends Error {
  // options.retryAfter بالثواني — بينتحوّل لهيدر Retry-After بالـ errorHandler.
  // اختياري وبيتجاهل لما ما ينتبعت، فكل النداءات القديمة بصيغة
  // (message, statusCode) بتضل شغالة متل ما هي
  constructor(message, statusCode, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (options.retryAfter != null) {
      this.retryAfter = options.retryAfter;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;