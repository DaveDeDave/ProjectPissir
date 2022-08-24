import { deleteField, getField, getAllCompanies } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (fieldID, user) => {
  const field = await getField(fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (user.companyID != field.companyID) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  await deleteField(fieldID);
};

const handler = async (req, res) => {
  const { params: { id }, jwt: { id: userID, companyID } } = req;
  res.code(204);
  await controller(id, { id: userID, companyID });
};

const schema = {
  tags: ["field"],
  summary: "Deletes a field",
  description: "Only admin and farmer roles can access this api",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    },
    additionalProperties: false
  },
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