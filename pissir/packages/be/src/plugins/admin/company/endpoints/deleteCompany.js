import { deleteCompany, getCompany } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (companyID, adminID) => {
  const company = await getCompany(companyID);
  if (!company || company.adminID != adminID) throw HTTP.notFound("Company does not exist");
  await deleteCompany(companyID);
};

const handler = async (req, res) => {
  const { params: { id }, jwt: { id: adminID } } = req;
  res.code(204);
  await controller(id, adminID);
};

const schema = {
  tags: ["admin-company"],
  summary: "Deletes a company",
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