const sensorSchema = {
  type: "object",
  required: ["topic", "fieldID"],
  properties: {
    topic: { type: "string" },
    fieldID: { type: "string" }
  },
  additionalProperties: false
};

export { sensorSchema };