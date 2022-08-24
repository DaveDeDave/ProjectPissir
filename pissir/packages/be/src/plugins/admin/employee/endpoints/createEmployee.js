import { ulid } from "ulid";
import { generateHash, generateRandomPassword } from "@pissir/lib/src/authentication.js";
import { createEmployee, getCompany } from "@pissir/lib/src/db.js";
import { HTTP } from "@pissir/lib/src/error.js";
import { employeeBody } from "../../../../schemas/employee.js";
import { errorSchema, internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (user, adminID) => {
  const company = await getCompany(user.companyID);
  if (!company || company.adminID != adminID) throw HTTP.notFound("Company does not exist");
  user.id = ulid();
  const password = generateRandomPassword();
  user.password = await generateHash(password);
  await createEmployee(user);
  return {
    id: user.id,
    password
  };
};

const handler = async (req, res) => {
  const { body, jwt: { id } } = req;
  return await controller(body, id);
};

const schema = {
  tags: ["admin-employee"],
  summary: "Creates an employee",
  description: "Only admin role can access this api",
  body: employeeBody,
  response: {
    200: {
      type: "object",
      required: ["id", "password"],
      properties: {
        id: { type: "string" },
        password: { type: "string" }
      },
      additionalProperties: false
    },
    404: errorSchema,
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};