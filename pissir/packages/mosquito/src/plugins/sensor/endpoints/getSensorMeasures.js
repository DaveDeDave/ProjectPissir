import { getAllCompanies, getAllMeasures, getField } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (sensor, user) => {
  const field = await getField(sensor.fieldID);
  if (!field) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  if (!user.companyID) {
    const companies = await getAllCompanies(user.id);
    if (!companies.find(company => company.id == field.companyID)) throw HTTP.notFound("Field does not exist", "server.error.fieldNotExist");
  } else if (field.companyID != user.companyID) throw HTTP.notFound("server.error.fieldNotExist");
  return await getAllMeasures(sensor);
};

const handler = async (req, res) => {
  const { query, params, jwt: { id, companyID } } = req;
  params.startDate = query.startDate;
  params.endDate = query.endDate;
  return await controller(params, { id, companyID });
};

const schema = {
  tags: ["sensor"],
  summary: "Get sensor measures",
  description: "Only authenticated users can access this api",
  query: {
    type: "object",
    required: ["startDate", "endDate"],
    properties: {
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" }
    },
    additionalProperties: false
  },
  params: {
    type: "object",
    required: ["fieldID", "topic"],
    properties: {
      fieldID: { type: "string" },
      topic: { type: "string" }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: { type: "number" },
          timestamp: { type: "string" }
        },
        additionalProperties: false
      }
    },
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};