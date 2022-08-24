import { updateUserData } from "@pissir/lib/src/db.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";
import { userData } from "../../../schemas/user.js";

const controller = async (user) => {
  await updateUserData(user);
};

const handler = async (req, res) => {
  const { body, jwt: { id } } = req;
  res.code(204);
  await controller({...body, id});
};

const schema = {
  tags: ["user"],
  summary: "Updates current user data",
  description: "Only authenticated users can access this api",
  body: userData,
  response: {
    204: {
      type: "null"
    },
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};