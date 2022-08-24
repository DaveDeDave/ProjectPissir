import { getUser } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { userData } from "../../../schemas/user.js";

const controller = async (id) => {
  const user = await getUser(id);
  if (!user) throw HTTP.notFound("User does not exist", "server.error.userNotExist");
  return user;
};

const handler = async (req, res) => {
  const { jwt: { id } } = req;
  return await controller(id);
};

const schema = {
  tags: ["user"],
  summary: "Gets current user data",
  description: "Only authenticated users can access this api",
  response: {
    200: userData,
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};