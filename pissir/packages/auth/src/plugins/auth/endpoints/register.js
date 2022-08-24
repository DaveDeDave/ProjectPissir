import { ulid } from "ulid";
import { generateHash, generateJWT } from "@pissir/lib/src/authentication.js";
import { createAdmin } from "@pissir/lib/src/db.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (user) => {
  user.id = ulid();
  user.password = await generateHash(user.password);
  await createAdmin(user);
  delete user.password;
  user.type = "admin";
  return { token: await generateJWT(user) };
};

const handler = async (req, res) => {
  const { body } = req;
  return await controller(body);
};

const schema = {
  tags: ["auth"],
  summary: "Registers an admin",
  description: "Everyone can access this api",
  body: {
    type: "object",
    required: ["email", "password", "name", "surname", "birthDate"],
    properties: {
      email: { type: "string", format: "email" },
      // La password deve essere almeno lunga 8 caratteri, deve contenere almeno una lettera maiuscola, una minuscola e un numero. 
      // Infine almeno uno di questi simboli: [!"#$%'()*+,-./]
      password: { type: "string", pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!\"#$%'()*+,-.\/]).{8,}$" },
      name: { type: "string" },
      surname: { type: "string" },
      birthDate: { type: "string", format: "date" }
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
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};