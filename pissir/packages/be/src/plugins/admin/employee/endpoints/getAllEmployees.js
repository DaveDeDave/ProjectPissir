import { getAllEmployeesCount, getAllEmployeesPaginated } from "@pissir/lib/src/db.js";
import { employeeResponse } from "../../../../schemas/employee.js";
import { paginationQuery, paginationResponse } from "@pissir/lib/src/schemas/pagination.js";
import { internalServerErrorSchema } from "@pissir/lib/src/schemas/error.js";

const controller = async (adminID, page, quantity) => {
  const result = await getAllEmployeesPaginated(adminID, page, quantity);
  const { count } = await getAllEmployeesCount(adminID);
  return { count, result  };
};

const handler = async (req, res) => {
  const { query: { page, quantity }, jwt: { id: adminID } } = req;
  return await controller(adminID, page, quantity);
};

const schema = {
  tags: ["admin-employee"],
  summary: "Gets all employees",
  description: "Only admin role can access this api",
  query: paginationQuery,
  response: {
    200: paginationResponse(employeeResponse),
    500: internalServerErrorSchema
  }
};

export default {
  schema,
  handler
};