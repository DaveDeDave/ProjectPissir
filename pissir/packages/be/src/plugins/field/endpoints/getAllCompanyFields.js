import { getAllFieldsCount, getAllFieldsPaginated, getCompany } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { fieldResponse } from "../../../schemas/field.js";
import { paginationQuery, paginationResponse } from "@pissir/lib/src/schemas/pagination.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (companyID, user, page, quantity) => {
  const company = await getCompany(companyID);
  if (!company) throw HTTP.notFound("Company does not exist", "server.error.companyNotExist");
  if (!user.companyID) {
    if (company.adminID != user.id) throw HTTP.notFound("Company does not exist", "server.error.companyNotExist");
  } else if (user.companyID != company.id) throw HTTP.notFound("Company does not exist", "server.error.companyNotExist");
  const result = await getAllFieldsPaginated(companyID, page, quantity);
  const { count } = await getAllFieldsCount(companyID);
  return { count, result };
};

const handler = async (req, res) => {
  const { query: { page, quantity }, params: { companyID }, jwt } = req;
  return await controller(companyID, { id: jwt.id, companyID: jwt.companyID }, page, quantity);
};

const schema = {
  tags: ["field"],
  summary: "Gets all field by company",
  description: "Only authenticated users can access this api",
  params: {
    type: "object",
    required: ["companyID"],
    properties: {
      companyID: { type: "string" }
    },
    additionalProperties: false
  },
  query: paginationQuery,
  response: {
    200: paginationResponse(fieldResponse),
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};