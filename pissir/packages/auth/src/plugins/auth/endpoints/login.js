import { verifyHash, generateJWT } from "@pissir/lib/src/authentication.js";
import { getUserByEmail } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) throw HTTP.notFound("User does not exist", "server.error.userNotExist");
  if (user.type && !user.active) throw HTTP.badRequest("User not yet activated", "server.error.userNotActivated");
  if (!(await verifyHash(password, user.password))) throw HTTP.unauthorized("Password is not correct", "server.error.passwordIncorrect");
  delete user.password;
  if (!user.type) user.type = "admin";
  return { token: await generateJWT(user) };
};

const handler = async (req, res) => {
  const { body: { email, password } } = req;
  return await controller(email, password);
};

const schema = {
  tags: ["auth"],
  description: "Everyone can access this api",
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" }
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