import { getAllCompanies, getAllEmployeesByCompanyIDPaginated, getAllEmployeesByCompanyIDCount } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { employeeResponse } from "../../../../schemas/employee.js";
import { paginationQuery, paginationResponse } from "@pissir/lib/src/schemas/pagination.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (companyID, adminID, page, quantity) => {
  const companies = await getAllCompanies(adminID);
  if (!companies.find(company => company.id == companyID)) throw HTTP.notFound("Company does not exist");
  const result = await getAllEmployeesByCompanyIDPaginated(companyID, page, quantity);
  const { count } = await getAllEmployeesByCompanyIDCount(companyID);
  return { count, result }
};

const handler = async (req, res) => {
  const { query: { page, quantity }, params: { companyID }, jwt: { id: adminID } } = req;
  return await controller(companyID, adminID, page, quantity);
};

const schema = {
  tags: ["admin-employee"],
  summary: "Gets all employees by company",
  description: "Only admin role can access this api",
  query: paginationQuery,
  params: {
    type: "object",
    required: ["companyID"],
    properties: {
      companyID: { type: "string" }
    },
    additionalProperties: false
  },
  response: {
    200: paginationResponse(employeeResponse),
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};