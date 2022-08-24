import { getField, updateField, getAllCompanies } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { fieldBody } from "../../../schemas/field.js";

const controller = async (fieldData, user) => {
  const field = await getField(fieldData.id);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (user.companyID != field.companyID) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  await updateField(fieldData);
};

const handler = async (req, res) => {
  const { params: { id }, body, jwt: { id: userID, companyID } } = req;
  res.code(204);
  await controller({ ...body, id }, { id: userID, companyID });
};

const schema = {
  tags: ["field"],
  summary: "Updates a field",
  description: "Only admin and farmer roles can access this api",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    },
    additionalProperties: false
  },
  body: fieldBody,
  response: {
    204: {
      type: "null"
    },
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};