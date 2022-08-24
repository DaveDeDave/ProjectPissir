const companyBody = {
  type: "object",
  required: ["name", "address"],
  properties: {
    name: { type: "string" },
    address: { type: "string" }
  },
  additionalProperties: false
};

const companyResponse = {
  type: "object",
  required: ["id", "name", "address"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    address: { type: "string" }
  },
  additionalProperties: false
};

export { companyBody, companyResponse };