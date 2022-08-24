import { getActuatorTopic, getAllCompanies, getField, updateConfiguration } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { updateConfigurationBody } from "../../../schemas/configuration.js";

const controller = async (configuration, user) => {
  const field = await getField(configuration.fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  const actuator = await getActuatorTopic({ topic: configuration.actuatorTopic, fieldID: configuration.fieldID });
  if (!actuator) throw HTTP.notFound("Actuator does not exist", "server.error.actuatorNotExist");
  await updateConfiguration(configuration);
};
const handler = async (req, res) => {
  const { body, jwt: { id, companyID } } = req;
  res.code(204);
  await controller(body, { id, companyID });
};

const schema = {
  tags: ["configuration"],
  summary: "Update the configuration of an actuator",
  description: "Only admin and farmer roles can access this api",
  body: updateConfigurationBody,
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