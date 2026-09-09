export const successResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
) => {
  const response = { success: true, message };

  if (data !== null) response.data = data;

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res,
  statusCode = 500,
  message = "Something went wrong",
) => {
  if (
    process.env.NODE_ENV === "development" &&
    statusCode >= 200 &&
    statusCode < 300
  ) {
    throw new Error(
      `errorResponse called with a 2xx status code (${statusCode}) — this breaks the success/status contract`,
    );
  }

  const response = { success: false, message };

  return res.status(statusCode).json(response);
};
