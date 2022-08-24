import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import authPlugin from "./src/plugins/auth/auth.js";
import { errorHandler } from "@pissir/lib/src/middlewares.js";
const app = Fastify();

// Swagger
if (process.env.ENV != "Prod") {
  app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: "/v1/auth/docs",
    tags: [
      { name: "auth", description: "auth end-points" }
    ],
    openapi: {
      info: {
        title: "pissir-auth",
        description: "Progetto d'esame: laboratorio di PISSIR (2021/2022) - Microservizio per l'autenticazione",
        version: "1.0.0"
      }
    }
  });
}

app.register(errorHandler);

// plugin register
const v1 = async (fastify, options) => {
  fastify.register(authPlugin, { prefix: "/auth" });
};
app.register(v1, { prefix: "/v1" });

export default app;