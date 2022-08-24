import { authenticationRequired, checkRole } from "@pissir/lib/src/middlewares.js";
import createField from "./endpoints/createField.js";
import updateField from "./endpoints/updateField.js";
import deleteField from "./endpoints/deleteField.js";
import getField from "./endpoints/getField.js";
import getAllFields from "./endpoints/getAllFields.js";
import getAllCompanyFields from "./endpoints/getAllCompanyFields.js";

const farmerAuthAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin", "farmer"]));
  fastify.post("/", createField);
  fastify.put("/:id", updateField);
  fastify.delete("/:id", deleteField);
};

const adminAuthAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.register(checkRole(["admin"]));
  fastify.get("/all", getAllFields);
};

const authAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.get("/:id", getField);
  fastify.get("/all/:companyID", getAllCompanyFields);
};

const fieldPlugin = async (fastify, opts) => {
  fastify.register(farmerAuthAPI);
  fastify.register(adminAuthAPI);
  fastify.register(authAPI);
};

export default fieldPlugin;