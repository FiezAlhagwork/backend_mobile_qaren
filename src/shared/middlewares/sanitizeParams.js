export const sanitizeParams = (req, res, next) => {
  for (const key in req.params) {
    const value = req.params[key];
    if (typeof value === "string" && /[$.]/.test(value)) {
      return res.status(400).json({ error: `Invalid parameter: ${key}` });
    }
  }
  next();
};
