import { authenticationRequired, checkRole } from "@pissir/lib/src/middlewares.js";
import createCompany from "./endpoints/createCompany.js";
import deleteCompany from "./endpoints/deleteCompany.js";
import getAllCompanies from "./endpoints/getAllCompanies.js";
import getCompany from "./endpoints/getCompany.js";
import updateCompany from "./endpoints/updateCompany.js";

const adminAuthAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin"]));
  fastify.post("/", createCompany);
  fastify.get("/:id", getCompany);
  fastify.get("/all", getAllCompanies);
  fastify.put("/:id", updateCompany);
  fastify.delete("/:id", deleteCompany);
}

const companyPlugin = async (fastify, opts) => {
  fastify.register(adminAuthAPI);
};

export default companyPlugin;