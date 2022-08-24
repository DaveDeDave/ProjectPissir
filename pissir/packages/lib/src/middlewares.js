import fp from "fastify-plugin";
import { verifyJWT } from "./authentication.js";
import { HTTP } from "./error.js";

const authenticationRequired = fp(async (fastify, opts) => {
  fastify.decorateRequest("jwt", null);
  fastify.addHook("preHandler", async (request, reply) => {
    if (!request.headers["authorization"]) throw HTTP.unauthorized("Missing authorization token");
    const token = request.headers["authorization"].split(" ")[1];
    request.jwt = await verifyJWT(token);
  });
});

const checkRole = role => fp(async (fastify, opts) => {
  fastify.addHook("preHandler", async (request, reply) => {
    if (role.indexOf(request.jwt.type) == -1) throw HTTP.forbidden("Unauthorized role");
  });
});

const errorHandler = fp(async (fastify, opts) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error.message == "DB_ERROR") {
      return HTTP.badRequest(error.message);
    }
    else return error;
  });
});

export {
  authenticationRequired,
  checkRole,
  errorHandler
};