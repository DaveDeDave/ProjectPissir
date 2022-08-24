import { authenticationRequired } from "@pissir/lib/src/middlewares.js";
import deleteUser from "./endpoints/deleteUser.js";
import getUserData from "./endpoints/getUserData.js";
import updatePassword from "./endpoints/updatePassword.js";
import updateUserData from "./endpoints/updateUserData.js";

const authAPI = async (fastify, opts) => {
  fastify.register(authenticationRequired);
  fastify.get("/", getUserData);
  fastify.patch("/password", updatePassword);
  fastify.patch("/", updateUserData);
  fastify.delete("/", deleteUser);
}

const userPlugin = async (fastify, opts) => {
  fastify.register(authAPI);
};

export default userPlugin;