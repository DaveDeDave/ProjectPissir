import { authenticationRequired, checkRole } from "@pissir/lib/src/middlewares.js";
import createEmployee from "./endpoints/createEmployee.js";
import deleteEmployee from "./endpoints/deleteEmployee.js";
import getAllCompanyEmployees from "./endpoints/getAllCompanyEmployees.js";
import getAllEmployees from "./endpoints/getAllEmployees.js";
import getEmployee from "./endpoints/getEmployee.js";

const adminAuthAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin"]))
  fastify.post("/", createEmployee);
  fastify.get("/:id", getEmployee);
  fastify.get("/all/:companyID", getAllCompanyEmployees);
  fastify.get("/all", getAllEmployees);
  fastify.delete("/:id", deleteEmployee);
};

const employeePlugin = async (fastify, opts) => {
  fastify.register(adminAuthAPI);
};

export default employeePlugin;