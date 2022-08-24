import activateEmployee from "./endpoints/activateEmployee.js";
import login from "./endpoints/login.js";
import register from "./endpoints/register.js";

const authPlugin = async (fastify, opts) => {
  fastify.post("/register", register);
  fastify.post("/login", login);
  fastify.post("/activate", activateEmployee);
};

export default authPlugin;