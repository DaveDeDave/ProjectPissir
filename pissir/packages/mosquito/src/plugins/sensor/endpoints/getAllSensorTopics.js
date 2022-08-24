import { getAllCompanies, getAllSensorTopicsCount, getAllSensorTopicsPaginated, getField } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { paginationQuery, paginationResponse } from "@pissir/lib/src/schemas/pagination.js";
import { sensorSchema } from "../../../schemas/sensor.js";

const controller = async (fieldID, user, page, quantity) => {
  const field = await getField(fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  const result = await getAllSensorTopicsPaginated(fieldID, page, quantity);
  const { count } = await getAllSensorTopicsCount(fieldID);
  return { count, result }; 
};

const handler = async (req, res) => {
  const { query: { page, quantity }, params: { fieldID }, jwt: { id, companyID } } = req;
  return await controller(fieldID, { id, companyID }, page, quantity);
};

const schema = {
  tags: ["sensor"],
  summary: "Get all sensor topics",
  description: "Only authenticated users can access this api",
  query: paginationQuery,
  params: {
    type: "object",
    required: ["fieldID"],
    properties: {
      fieldID: { type: "string" }
    },
    additionalProperties: false
  },
  response: {
    200: paginationResponse(sensorSchema),
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};