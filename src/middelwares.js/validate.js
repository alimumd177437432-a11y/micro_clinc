export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message.replace(/"/g, ""));
    return res.status(400).json({ status: "error", message: messages.join(", ") });
  }
  next();
};