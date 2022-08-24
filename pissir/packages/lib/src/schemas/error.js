const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
    message: { type: "string" }
  }
};

const internalServerErrorSchema = {
  type: "object",
  properties: {
    error: { type: "string" }
  }
};

export { errorSchema, internalServerErrorSchema };