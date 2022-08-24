import { getAllCompanies, getUser } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { employeeResponse } from "../../../../schemas/employee.js";

const controller = async (employeeID, adminID) => {
  const employee = await getUser(employeeID);
  if (!employee || !employee.type) throw HTTP.notFound("Employee does not exist");
  const companies = await getAllCompanies(adminID);
  if (!companies.find(company => company.id == employee.companyID)) throw HTTP.notFound("Employee does not exist");
  return employee;
};

const handler = async (req, res) => {
  const { params: { id }, jwt: { id: adminID } } = req;
  return await controller(id, adminID);
};

const schema = {
  tags: ["admin-employee"],
  summary: "Gets an employee",
  description: "Only admin role can access this api",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    },
    additionalProperties: false
  },
  response: {
    200: employeeResponse,
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};