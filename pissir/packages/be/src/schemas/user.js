const userData = {
  type: "object",
  required: ["name", "surname", "birthDate"],
  properties: {
    name: { type: "string" },
    surname: { type: "string" },
    birthDate: { type: "string" }
  },
  additionalProperties: false
};

export { userData };