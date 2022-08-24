import { deleteUser } from "@pissir/lib/src/db.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (id) => {
  await deleteUser(id);
};

const handler = async (req, res) => {
  const { jwt: { id } } = req;
  res.code(204);
  await controller(id);
};

const schema = {
  tags: ["user"],
  summary: "Deletes current user",
  description: "Only authenticated users can access this api",
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