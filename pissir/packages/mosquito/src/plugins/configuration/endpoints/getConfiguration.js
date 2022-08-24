import { getAllCompanies, getConfiguration, getField } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { configurationBody } from "../../../schemas/configuration.js";

const controller = async (configurationData, user) => {
  const field = await getField(configurationData.fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  const configuration = await getConfiguration(configurationData);
  if (!configuration) throw HTTP.notFound("server.error.configurationNotExist");
  return configuration;
};
const handler = async (req, res) => {
  const { params, jwt: { id, companyID } } = req;
  return await controller(params, { id, companyID });
};

const schema = {
  tags: ["configuration"],
  summary: "Get the configuration of an actuator",
  description: "Only admin and farmer roles can access this api",
  params: {
    type: "object",
    required: ["fieldID", "actuatorTopic"],
    properties: {
      fieldID: { type: "string" },
      actuatorTopic: { type: "string" }
    },
    additionalProperties: false
  },
  response: {
    200: configurationBody,
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};