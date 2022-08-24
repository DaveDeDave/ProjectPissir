const configurationBody = {
  type: "object",
  required: ["actuatorTopic", "fieldID", "conditionFalse", "conditionTrue"],
  anyOf: [
    { required: ["startTime", "endTime"] },
    { required: ["sensorTopic", "conditionType", "conditionValue"] }
  ],
  properties: {
    actuatorTopic: { type: "string" },
    fieldID: { type: "string" },
    sensorTopic: { type: "string" },
    conditionType: { type: "string", enum: ["<", ">"] },
    conditionValue: { type: "integer" },
    conditionFalse: { type: "integer" },
    conditionTrue: { type: "integer" },
    startTime: { type: "integer", minimum: 0, maximum: 23 },
    endTime: { type: "integer", minimum: 1, maximum: 24 }
  },
  additionalProperties: false
};

const updateConfigurationBody = {
  type: "object",
  required: ["actuatorTopic", "fieldID"],
  properties: {
    actuatorTopic: { type: "string" },
    fieldID: { type: "string" },
    sensorTopic: { type: "string" },
    conditionType: { type: "string", enum: ["<", ">"] },
    conditionValue: { type: "integer" },
    conditionFalse: { type: "integer" },
    conditionTrue: { type: "integer" },
    startTime: { type: "integer", minimum: 0, maximum: 23 },
    endTime: { type: "integer", minimum: 1, maximum: 24 }
  },
  additionalProperties: false
};



export { configurationBody, updateConfigurationBody }