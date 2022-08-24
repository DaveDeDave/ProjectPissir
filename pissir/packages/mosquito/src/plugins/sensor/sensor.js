import { authenticationRequired, checkRole } from "@pissir/lib/src/middlewares.js";
import addSensorTopic from "./endpoints/addSensorTopic.js";
import removeSensorTopic from "./endpoints/removeSensorTopic.js";
import getAllSensorTopics from "./endpoints/getAllSensorTopics.js";
import getSensorMeasures from "./endpoints/getSensorMeasures.js";

const adminFarmerActuatorAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin", "farmer"]));
  fastify.post("/", addSensorTopic);
  fastify.delete("/", removeSensorTopic);
};

const authAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.get("/:fieldID/all", getAllSensorTopics);
  fastify.get("/:fieldID/:topic/measures", getSensorMeasures);
};

const sensorPlugin = async (fastify, opts) => {
  fastify.register(adminFarmerActuatorAPI);
  fastify.register(authAPI);
};

export default sensorPlugin;