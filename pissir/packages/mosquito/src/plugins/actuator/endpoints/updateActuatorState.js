import { getAllCompanies, getField, updateActiveStateConfiguration } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { publishToActuator } from "@pissir/lib/src/mqtt.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { actuatorUpdate } from "../../../schemas/actuator.js";

const controller = async (actuator, user) => {
  const field = await getField(actuator.fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  await updateActiveStateConfiguration({
    actuatorTopic: actuator.topic,
    fieldID: actuator.fieldID,
    active: actuator.auto ?? false
  });
  if (actuator.value) publishToActuator(actuator.fieldID, actuator.topic, { value: actuator.value });
};

const handler = async (req, res) => {
  const { body, jwt: { id, companyID } } = req;
  res.code(204);
  await controller(body, { id, companyID });
};

const schema = {
  tags: ["actuator"],
  summary: "Update actuator state",
  description: "Only authenticated users can access this api",
  body: actuatorUpdate,
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