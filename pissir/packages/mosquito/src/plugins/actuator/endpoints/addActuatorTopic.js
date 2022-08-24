import { addActuatorTopic, getAllCompanies, getField } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { actuatorSchema } from "../../../schemas/actuator.js";

const controller = async (actuator, user) => {
  const field = await getField(actuator.fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  await addActuatorTopic(actuator);
};

const handler = async (req, res) => {
  const { body, jwt: { id, companyID } } = req;
  res.code(204);
  await controller(body, { id, companyID });
};

const schema = {
  tags: ["actuator"],
  summary: "Add an actuator topic",
  description: "Only admin and farmer roles can access this api",
  body: actuatorSchema,
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