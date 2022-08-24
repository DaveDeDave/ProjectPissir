import { verifyHash, generateJWT, generateHash } from "@pissir/lib/src/authentication.js";
import { getUserByEmail, updateUserPasswordAndActivateEmployee } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (email, oldPassword, newPassword) => {
  const user = await getUserByEmail(email);
  if (!user) throw HTTP.notFound("User does not exist", "server.error.userNotExist");
  if (user.active) throw HTTP.badRequest("User already active", "server.error.userAlreadyActivated");
  if (!(await verifyHash(oldPassword, user.password))) throw HTTP.unauthorized("Old password is not correct", "server.error.oldPasswordIncorrect");
  await updateUserPasswordAndActivateEmployee(user.id, await generateHash(newPassword));
  delete user.password;
  return { token: await generateJWT(user) };
};

const handler = async (req, res) => {
  const { body: { email, oldPassword, newPassword } } = req;
  return await controller(email, oldPassword, newPassword);
};

const schema = {
  tags: ["auth"],
  summary: "Activates an employee",
  description: "Everyone can access this api",
  body: {
    type: "object",
    required: ["email", "oldPassword", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      oldPassword: { type: "string" },
      newPassword: { type: "string", pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!\"#$%'()*+,-.\/]).{8,}$" }
    },
    additionalProperties: false
  },
  response: {
    200: {
      type: "object",
      required: ["token"],
      properties: {
        token: { type: "string" }
      },
      additionalProperties: false
    },
    400: errorSchema,
    401: errorSchema,
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};