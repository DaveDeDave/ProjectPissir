import { getAllFieldsByAdminIDCount, getAllFieldsByAdminIDPaginated } from "@pissir/lib/src/db.js";
import { fieldResponse } from "../../../schemas/field.js";
import { paginationQuery, paginationResponse } from "@pissir/lib/src/schemas/pagination.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (adminID, page, quantity) => {
  const result = await getAllFieldsByAdminIDPaginated(adminID, page, quantity);
  const { count } = await getAllFieldsByAdminIDCount(adminID);
  return { count, result };
};

const handler = async (req, res) => {
  const { query: { page, quantity }, jwt: { id: adminID } } = req;
  return await controller(adminID, page, quantity);
};

const schema = {
  tags: ["field"],
  summary: "Gets all fields",
  description: "Only admin role can access this api",
  query: paginationQuery,
  response: {
    200: paginationResponse(fieldResponse),
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};