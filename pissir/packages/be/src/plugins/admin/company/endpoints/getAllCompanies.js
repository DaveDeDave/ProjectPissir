import { getAllCompaniesCount, getAllCompaniesPaginated } from "@pissir/lib/src/db.js";
import { companyResponse } from "../../../../schemas/company.js";
import { paginationQuery, paginationResponse } from "@pissir/lib/src/schemas/pagination.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (adminID, page, quantity) => {
  const result = await getAllCompaniesPaginated(adminID, page, quantity);
  const { count } = await getAllCompaniesCount(adminID);
  return { count, result };
};

const handler = async (req, res) => {
  const { query: { page, quantity }, jwt: { id } } = req;
  return await controller(id, page, quantity);
};

const schema = {
  tags: ["admin-company"],
  summary: "Gets a company",
  description: "Only admin role can access this api",
  query: paginationQuery,
  response: {
    200: paginationResponse(companyResponse),
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};