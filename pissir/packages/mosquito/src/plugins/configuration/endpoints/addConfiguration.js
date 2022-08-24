import { addConfiguration, getActuatorTopic, getAllCompanies, getField } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { configurationBody } from "../../../schemas/configuration.js";

const controller = async (configuration, user) => {
  const field = await getField(configuration.fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  const actuator = await getActuatorTopic({ topic: configuration.actuatorTopic, fieldID: configuration.fieldID });
  if (!actuator) throw HTTP.notFound("Actuator does not exist", "server.error.actuatorNotExist");
  await addConfiguration(configuration);
};
const handler = async (req, res) => {
  const { body, jwt: { id, companyID } } = req;
  res.code(204);
  await controller(body, { id, companyID });
};

const schema = {
  tags: ["configuration"],
  summary: "Add the configuration of an actuator",
  description: "Only admin and farmer roles can access this api",
  body: configurationBody,
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