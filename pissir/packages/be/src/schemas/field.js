const fieldBody = {
  type: "object",
  required: ["name", "outdoor"],
  properties: {
    name: { type: "string" },
    outdoor: { type: "boolean" },
    address: { type: "string" },
    companyID: { type: "string" }
  },
  additionalProperties: false
};

const fieldResponse = {
  type: "object",
  required: ["id", "name", "outdoor"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    outdoor: { type: "boolean" },
    address: { type: "string" },
    companyID: { type: "string" }
  },
  additionalProperties: false
};

export { fieldBody, fieldResponse };