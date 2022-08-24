import { getAllCompanies, getField } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { fieldResponse } from "../../../schemas/field.js";

const controller = async (fieldID, user) => {
  const field = await getField(fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (user.companyID != field.companyID) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  return field;
};

const handler = async (req, res) => {
  const { params: { id }, jwt: { id: userID, companyID } } = req;
  return await controller(id, { id: userID, companyID });
};

const schema = {
  tags: ["field"],
  summary: "Gets a field",
  description: "Only authenticated users can access this api",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    },
    additionalProperties: false
  },
  response: {
    200: fieldResponse,
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};