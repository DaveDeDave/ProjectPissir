import { ulid } from "ulid";
import { createCompany } from "@pissir/lib/src/db.js";
import { companyBody } from "../../../../schemas/company.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (company) => {
  company.id = ulid();
  await createCompany(company);
  return { id: company.id };
};

const handler = async (req, res) => {
  const { body, jwt: { id } } = req;
  body.adminID = id;
  return await controller(body);
};

const schema = {
  tags: ["admin-company"],
  summary: "Creates a company",
  description: "Only admin role can access this api",
  body: companyBody,
  response: {
    200: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      },
      additionalProperties: false
    },
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};