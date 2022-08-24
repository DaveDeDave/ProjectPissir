import { verifyHash, generateHash } from "@pissir/lib/src/authentication.js";
import { getUser, updateUserPassword } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (id, oldPassword, newPassword) => {
  const user = await getUser(id);
  if (!user) throw HTTP.notFound("User does not exist", "server.error.userNotExist");
  if (!(await verifyHash(oldPassword, user.password))) throw HTTP.forbidden("Old password is not correct", "server.error.oldPasswordIncorrect");
  await updateUserPassword(id, await generateHash(newPassword));
};

const handler = async (req, res) => {
  const { body: { oldPassword, newPassword }, jwt: { id } } = req;
  res.code(204);
  await controller(id, oldPassword, newPassword);
};

const schema = {
  tags: ["user"],
  summary: "Updates current user password",
  description: "Only authenticated users can access this api",
  body: {
    type: "object",
    required: ["oldPassword", "newPassword"],
    properties: {
      oldPassword: { type: "string" },
      newPassword: { type: "string", pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!\"#$%'()*+,-.\/]).{8,}$" }
    },
    additionalProperties: false
  },
  response: {
    204: {
      type: "null"
    },
    403: errorSchema,
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};