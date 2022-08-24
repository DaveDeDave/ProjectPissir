import { authenticationRequired, checkRole } from "@pissir/lib/src/middlewares.js";
import addConfiguration from "./endpoints/addConfiguration.js";
import getConfiguration from "./endpoints/getConfiguration.js";
import removeConfiguration from "./endpoints/removeConfiguration.js";
import updateConfiguration from "./endpoints/updateConfiguration.js";

const adminFarmerActuatorAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin", "farmer"]));
  fastify.post("/", addConfiguration);
  fastify.get("/:fieldID/:actuatorTopic", getConfiguration);
  fastify.put("/", updateConfiguration);
  fastify.delete("/", removeConfiguration);
};

const configurationPlugin = async (fastify, opts) => {
  fastify.register(adminFarmerActuatorAPI);
};

export default configurationPlugin;