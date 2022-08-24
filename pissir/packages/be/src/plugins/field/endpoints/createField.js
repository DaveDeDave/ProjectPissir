import { ulid } from "ulid";
import { createField, getAllCompanies } from "@pissir/lib/src/db.js";
import { fieldBody } from "../../../schemas/field.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (field, user) => {
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Company does not exist", "server.error.companyNotExist");
  } else if (user.companyID != field.companyID) throw HTTP.notFound("Company does not exist", "server.error.companyNotExist");
  field.id = ulid();
  await createField(field);
  return { id: field.id };
};

const handler = async (req, res) => {
  const { body, jwt: { id, companyID } } = req;
  return await controller(body, { id, companyID});
};

const schema = {
  tags: ["field"],
  summary: "Creates a field",
  description: "Only admin and farmer roles can access this api",
  body: fieldBody,
  response: {
    200: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      },
      additionalProperties: false
    },
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};