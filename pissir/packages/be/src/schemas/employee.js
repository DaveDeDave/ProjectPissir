const employeeBody = {
  type: "object",
  required: ["email", "name", "surname", "birthDate", "type"],
  properties: {
    email: { type: "string", format: "email" },
    name: { type: "string" },
    surname: { type: "string" },
    birthDate: { type: "string", format: "date" },
    type: { type: "string", enum: ["farmer", "collaborator"] },
    companyID: { type: "string" }
  },
  additionalProperties: false
};

const employeeResponse = {
  type: "object",
  required: ["id", "email", "name", "surname", "birthDate", "type"],
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    name: { type: "string" },
    surname: { type: "string" },
    birthDate: { type: "string", format: "date" },
    type: { type: "string", enum: ["farmer", "collaborator"] },
    active: { type: "boolean" },
    companyID: { type: "string" }
  },
  additionalProperties: false
};

export { employeeBody, employeeResponse };