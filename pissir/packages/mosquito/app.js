import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import ws from "@fastify/websocket";
import { errorHandler } from "@pissir/lib/src/middlewares.js";
import actuatorPlugin from "../mosquito/src/plugins/actuator/actuator.js";
import sensorPlugin from "../mosquito/src/plugins/sensor/sensor.js";
import configurationPlugin from "./src/plugins/configuration/configuration.js";
import { getActuatorState, subscribeActuatorChanges } from "@pissir/lib/src/mqtt.js";
import { verifyJWT } from "@pissir/lib/src/authentication.js";
import "./handleConfigurations.js";
const app = Fastify();

// Swagger
if (process.env.ENV != "Prod") {
  app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: "/v1/mosquito/docs",
    tags: [
      { name: "actuator", description: "actuator end-points" },
      { name: "sensor", description: "sensor end-points" },
      { name: "configuration", description: "configuration end-points" }
    ],
    openapi: {
      info: {
        title: "pissir-mosquito",
        description: "Progetto d'esame: laboratorio di PISSIR (2021/2022) - Microservizio per mosquito",
        version: "1.0.0"
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      security: [ { bearerAuth: [] } ]
    }
  });
}

app.register(errorHandler);

app.register(ws);
app.register(async function (fastify) {
  fastify.get("/ws/", { websocket: true }, async (connection, req) => {
    try {
      await verifyJWT(req.query.authorization);
      connection.socket.on("message", (message) => {
        if (message.toString() == "forceRefresh") {
          getActuatorState(req.query.fieldID, req.query.topic);
        }
      });
      getActuatorState(req.query.fieldID, req.query.topic);
      subscribeActuatorChanges(req.query.fieldID, req.query.topic, (topic, message) => {
        const value = JSON.parse(message).value;
        connection.socket.send(value);
      });
    } catch(e) {
      console.log(e);
      connection.socket.close();
    }
  });
});


// plugin register
const v1 = async (fastify, options) => {
  fastify.register(actuatorPlugin, { prefix: "/actuator" });
  fastify.register(sensorPlugin, { prefix: "/sensor" });
  fastify.register(configurationPlugin, { prefix: "/configuration" });
};
app.register(v1, { prefix: "/v1/mosquito" });

export default app;