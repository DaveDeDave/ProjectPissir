const actuatorSchema = {
  type: "object",
  required: ["topic", "fieldID"],
  properties: {
    topic: { type: "string" },
    fieldID: { type: "string" }
  },
  additionalProperties: false
};

const actuatorUpdate = {
  type: "object",
  required: ["topic", "fieldID"],
  anyOf: [
    { required: ["value"] },
    { required: ["auto"] }
  ],
  properties: {
    topic: { type: "string" },
    fieldID: { type: "string" },
    value: { type: "number" },
    auto: { type: "boolean" }
  },
  additionalProperties: false
};

export { actuatorSchema, actuatorUpdate };