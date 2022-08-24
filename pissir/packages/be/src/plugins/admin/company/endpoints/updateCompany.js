import { getCompany, updateCompany } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { companyBody } from "../../../../schemas/company.js";

const controller = async (companyData, adminID) => {
  const company = await getCompany(companyData.id);
  if (!company || company.adminID != adminID) throw HTTP.notFound("Company does not exist", "server.error.companyNotExist");
  await updateCompany(companyData);
};

const handler = async (req, res) => {
  const { params: { id }, body, jwt: { id: adminID } } = req;
  body.id = id;
  res.code(204);
  await controller(body, adminID);
};

const schema = {
  tags: ["admin-company"],
  summary: "Updates a company",
  description: "Only admin role can access this api",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" }
    },
    additionalProperties: false
  },
  body: companyBody,
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