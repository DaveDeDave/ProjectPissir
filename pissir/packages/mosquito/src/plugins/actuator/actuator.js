import { authenticationRequired, checkRole } from "@pissir/lib/src/middlewares.js";
import addActuatorTopic from "./endpoints/addActuatorTopic.js";
import getAllActuatorTopics from "./endpoints/getAllActuatorTopics.js";
import removeActuatorTopic from "./endpoints/removeActuatorTopic.js";
import updateActuatorState from "./endpoints/updateActuatorState.js";

const adminFarmerAuthAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin", "farmer"]));
  fastify.post("/", addActuatorTopic);
  fastify.delete("/", removeActuatorTopic);
};

const authAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.get("/:fieldID/all", getAllActuatorTopics);
  fastify.post("/state", updateActuatorState);
};

const actuatorPlugin = async (fastify, opts) => {
  fastify.register(adminFarmerAuthAPI);
  fastify.register(authAPI);
};

export default actuatorPlugin;