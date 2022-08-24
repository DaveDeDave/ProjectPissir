const paginationQuery = {
  type: "object",
  required: ["page", "quantity"],
  properties: {
    page: { type: "number" },
    quantity: { type: "number" }
  },
  additionalProperties: false
};

const paginationResponse = (resultSchema) => {
  return {
    type: "object",
    required: ["count", "result"],
    properties: {
      count: { type: "integer" },
      result: {
        type: "array",
        items: resultSchema
      }
    },
    additionalProperties: false
  }
}

export { paginationQuery, paginationResponse };