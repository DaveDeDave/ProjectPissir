import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import employeePlugin from "./src/plugins/admin/employee/employee.js";
import companyPlugin from "./src/plugins/admin/company/company.js";
import userPlugin from "./src/plugins/user/user.js";
import fieldPlugin from "./src/plugins/field/field.js";
const app = Fastify();

// Swagger
if (process.env.ENV != "Prod") {
  app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: "/v1/docs",
    tags: [
      { name: "admin-employee", description: "employee end-points" },
      { name: "admin-company", description: "company end-points" },
      { name: "user", description: "user end-points" },
      { name: "field", description: "field end-points" }
    ],
    openapi: {
      info: {
        title: "pissir-be",
        description: "Progetto d'esame: laboratorio di PISSIR (2021/2022) - Backend",
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

// plugin register

const admin = async (fastify, options) => {
  fastify.register(employeePlugin, { prefix: "/employee" });
  fastify.register(companyPlugin, { prefix: "/company" });
};

const v1 = async (fastify, options) => {
  fastify.register(userPlugin, { prefix: "/user" });
  fastify.register(fieldPlugin, { prefix: "/field" });
  fastify.register(admin, { prefix: "/admin" });
};

app.register(v1, { prefix: "/v1" });

export default app;