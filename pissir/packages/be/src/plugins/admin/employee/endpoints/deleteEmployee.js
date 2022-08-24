import { deleteUser, getCompany, getUser } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (userID, adminID) => {
  const user = await getUser(userID);
  if (!user) throw HTTP.notFound("User does not exist");
  const company = await getCompany(user.companyID);
  if (!company) throw HTTP.notFound("Company does not exist");
  if (company.adminID != adminID) throw HTTP.notFound("User does not exist");
  await deleteUser(userID);
};

const handler = async (req, res) => {
  const { params: { id }, jwt: { id: adminID } } = req;
  res.code(204);
  await controller(id, adminID);
};

const schema = {
  tags: ["admin-employee"],
  summary: "Deletes an employee",
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