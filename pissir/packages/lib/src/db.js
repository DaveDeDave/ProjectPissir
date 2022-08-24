import mariadb from "mariadb";
import fs from "fs/promises";
import { HTTP } from "./error.js";

const connect = async (options) => {
  return await mariadb.createConnection({
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    timezone: "auto",
    multipleStatements: options?.multipleStatements ?? false
  });
};

const disconnect = (session) => {
  if (session) session.end();
};

const query = async (connection, query, params) => {
  try {
    return await connection.query(query, params);
  } catch (e) {
    if (e.code == "ER_DUP_ENTRY") throw HTTP.badRequest("AlreadyExists", "server.error.emailAlreadyExist");
    else {
      console.log("DB_ERROR:", e.code, e);
      throw HTTP.internalServerError("UnkownDBError");
    }
  }
};

const prepareInputs = async (file) => {
  const connection = await connect({ multipleStatements: true });
  try {
    await connection.query(await fs.readFile(file, "utf-8"));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
}

const truncateAllTables = async () => {
  const connection = await connect();
  try {
    await query(connection, "SET FOREIGN_KEY_CHECKS = 0");
    const tables = await query(connection, "SHOW TABLES");
    tables.forEach(async table => { await connection.query(`DELETE FROM ${table.Tables_in_pissir}`); });
    await query(connection, "SET FOREIGN_KEY_CHECKS = 1");
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Creates an admin user
 * @param {Object} user
 * @property {String} id - admin's id
 * @property {String} email - admin's email
 * @property {String} name - admin's name
 * @property {String} surname - admin's surname
 * @property {String} password - admin's hashed password
 * @property {String} birthDate - admin's birth date
 */
const createAdmin = async (user) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO user VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.email, user.name, user.surname, user.password, user.birthDate]);
    await query(connection, "INSERT INTO admin VALUES (?)", [user.id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Creates an employee user
 * @param {Object} user
 * @property {String} id - employee's id
 * @property {String} email - employee's email
 * @property {String} name - employee's name
 * @property {String} surname - employee's surname
 * @property {String} password - employee's hashed password
 * @property {String} birthDate - employee's birth date
 * @property {String} type - employee's type (farmer or collaborator)
 * @property {String} companyID - id of the company the employee works for
 */
const createEmployee = async (user) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO user VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.email, user.name, user.surname, user.password, user.birthDate]);
    await query(connection, "INSERT INTO employee VALUES (?, ?, false, ?)", [user.id, user.type, user.companyID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets a user by id
 * @param {String} id - user's id
 */
const getUser = async (id) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT user.*, employee.type, employee.companyID, employee.active FROM user LEFT JOIN employee ON user.id = employee.id WHERE user.id = ?", [id]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets a user by email
 * @param {String} email - user's email 
 */
const getUserByEmail = async (email) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT user.*, employee.type, employee.companyID, employee.active FROM user LEFT JOIN employee ON user.id = employee.id WHERE user.email = ?", [email]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all employees by adminID
 * @param {String} adminID - admin's id
 */
const getAllEmployees = async (adminID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT user.*, employee.type, employee.companyID, employee.active FROM user JOIN employee ON user.id = employee.id JOIN company ON employee.companyID = company.id WHERE company.adminID = ?", [adminID]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};


/**
 * Gets all employees by adminID
 * @param {String} adminID - admin's id
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page
 */
const getAllEmployeesPaginated = async (adminID, page, quantity) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT user.*, employee.type, employee.companyID, employee.active FROM user JOIN employee ON user.id = employee.id JOIN company ON employee.companyID = company.id WHERE company.adminID = ? LIMIT ? OFFSET ?", [adminID, quantity, (page - 1) * quantity]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of employees of the specified adminID
 * @param {String} adminID - admin's id
 */
const getAllEmployeesCount = async (adminID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM user JOIN employee ON user.id = employee.id JOIN company ON employee.companyID = company.id WHERE company.adminID = ?", [adminID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all employees by companyID
 * @param {String} companyID - company's id
 */
const getAllEmployeesByCompanyID = async (companyID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT user.*, employee.type, employee.companyID, employee.active FROM user JOIN employee ON user.id = employee.id JOIN company ON employee.companyID = company.id WHERE company.id = ?", [companyID]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all employees by companyID
 * @param {String} companyID - company's id
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page
 */
const getAllEmployeesByCompanyIDPaginated = async (companyID, page, quantity) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT user.*, employee.type, employee.companyID, employee.active FROM user JOIN employee ON user.id = employee.id JOIN company ON employee.companyID = company.id WHERE company.id = ? LIMIT ? OFFSET ?", [companyID, quantity, (page - 1) * quantity]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of employees of the specified companyID
 * @param {String} companyID - company's id
 */
const getAllEmployeesByCompanyIDCount = async (companyID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM user JOIN employee ON user.id = employee.id JOIN company ON employee.companyID = company.id WHERE company.id = ?", [companyID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates user's data
 * @param {Object} user
 * @property {String} id - employee's id
 * @property {String} name - employee's name
 * @property {String} surname - employee's surname
 * @property {String} birthDate - employee's birth date
 */
const updateUserData = async (user) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE user SET name = ?, surname = ?, birthDate = ? WHERE id = ?", [user.name, user.surname, user.birthDate, user.id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates user's password
 * @param {String} id - user's id
 * @param {String} hash - user's hashed password 
 */
const updateUserPassword = async (id, hash) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE user SET password = ? WHERE id = ?", [hash, id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates employee's password and activate its profile
 * @param {String} id - employee's id
 * @param {*} hash - employee's hashed password
 */
const updateUserPasswordAndActivateEmployee = async (id, hash) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE user SET password = ? WHERE id = ?", [hash, id]);
    await query(connection, "UPDATE employee SET active = true WHERE id = ?", [id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Deletes a user by id
 * @param {String} id - user's id
 */
const deleteUser = async (id) => {
  const connection = await connect();
  try {
    await query(connection, "DELETE FROM user WHERE id = ?", [id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Creates a company
 * @param {Object} company
 * @property {String} id - company's id
 * @property {String} adminID - id of the company's admin
 * @property {String} name - company's name
 * @property {String} address - company's address
 */
const createCompany = async (company) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO company VALUES (?, ?, ?, ?)", [company.id, company.adminID, company.name, company.address]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets a company by id
 * @param {String} id - company's id
 */
const getCompany = async (id) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM company WHERE id = ?", [id]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all companies of the specified admin
 * @param {String} adminID - id of the company's admin
 */
const getAllCompanies = async (adminID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM company WHERE adminID = ?", [adminID]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all companies of the specified admin
 * @param {String} adminID - id of the company's admin
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page 
 */
const getAllCompaniesPaginated = async (adminID, page, quantity) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM company WHERE adminID = ? LIMIT ? OFFSET ?", [adminID, quantity, (page - 1) * quantity]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of companies of the specified adminID
 * @param {String} adminID - admin's id
 */
const getAllCompaniesCount = async (adminID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM company WHERE adminID = ?", [adminID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates a company's data
 * @param {Object} company
 * @property {String} id - company's id
 * @property {String} name - company's name
 * @property {String} address - company's address
 */
const updateCompany = async (company) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE company SET name = ?, address = ? WHERE id = ?", [company.name, company.address, company.id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
}

/**
 * Deletes a company by id
 * @param {String} id - company's id 
 */
const deleteCompany = async (id) => {
  const connection = await connect();
  try {
    await query(connection, "DELETE FROM company WHERE id = ?", [id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Creates a field
 * @param {Object} field
 * @property {String} id - field's id
 * @property {String} name - field's name
 * @property {String} outdoor - if the field is located outside or inside
 * @property {String} address - field's address
 * @property {String} companyID - id of the company that own the field
 */
const createField = async (field) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO field VALUES (?, ?, ?, ?, ?)", [field.id, field.name, field.outdoor, field.address, field.companyID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets a field by id
 * @param {String} id - field's id
 */
const getField = async (id) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM field WHERE id = ?", [id]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Get all fields of the specified company
 * @param {String} companyID - id of the company that own the field
 */
const getAllFields = async (companyID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT field.* FROM field JOIN company ON field.companyID = company.id WHERE company.id = ?", [companyID]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Get all fields of the specified company
 * @param {String} companyID - id of the company that own the field
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page 
 */
const getAllFieldsPaginated = async (companyID, page, quantity) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT field.* FROM field JOIN company ON field.companyID = company.id WHERE company.id = ? LIMIT ? OFFSET ?", [companyID, quantity, (page - 1) * quantity]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of fields of the specified company
 * @param {String} companyID - id of the company that own the field
 */
const getAllFieldsCount = async (companyID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM field JOIN company ON field.companyID = company.id WHERE company.id = ?", [companyID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Get all fields of the specified admin
 * @param {String} adminID - id of the admin that own the field
 */
const getAllFieldsByAdminID = async (adminID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT field.* FROM field JOIN company ON field.companyID = company.id WHERE company.adminID = ?", [adminID]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Get all fields of the specified admin
 * @param {String} adminID - id of the admin that own the field
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page 
 */
const getAllFieldsByAdminIDPaginated = async (adminID, page, quantity) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT field.* FROM field JOIN company ON field.companyID = company.id WHERE company.adminID = ? LIMIT ? OFFSET ?", [adminID, quantity, (page - 1) * quantity]));
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of fields of the specified company admin
 * @param {String} adminID - id of the admin that own the field
 */
const getAllFieldsByAdminIDCount = async (adminID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM field JOIN company ON field.companyID = company.id WHERE company.adminID = ?", [adminID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates a field's data
 * @param {Object} field
 * @property {String} id - field's id
 * @property {String} name - field's name
 * @property {String} outdoor - if the field is located outside or inside
 * @property {String} address - field's address
 */
const updateField = async (field) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE field SET name = ?, outdoor = ?, address = ? WHERE id = ?", [field.name, field.outdoor, field.address, field.id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
}

/**
 * Deletes a field by id
 * @param {String} id - field's id
 */
const deleteField = async (id) => {
  const connection = await connect();
  try {
    await query(connection, "DELETE FROM field WHERE id = ?", [id]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Adds an actuator topic
 * @param {Object} actuator
 * @property {String} topic - actuator's topic name
 * @property {String} fieldID - id of the field where the actuator is placed
 */
const addActuatorTopic = async (actuator) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO actuator VALUES (?, ?)", [actuator.topic, actuator.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets an actuator topic
 * @param {Object} actuator
 * @property {String} topic - actuator's topic name
 * @property {String} fieldID - id of the field where the actuator is placed
 */
const getActuatorTopic = async (actuator) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM actuator WHERE topic = ? AND fieldID = ?", [actuator.topic, actuator.fieldID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * It returns all actuators (necessary for the simulator)
 */
 const getAllActuators = async () => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM actuator");
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all actuators topics of the specified field
 * @param {String} fieldID - id of the field where the actuator is placed
 */
const getAllActuatorTopics = async (fieldID) => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM actuator WHERE fieldID = ?", [fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all actuator topics of the specified field
 * @param {String} fieldID - id of the field where the actuator is placed
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page 
 */
const getAllActuatorTopicsPaginated = async (fieldID, page, quantity) => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM actuator WHERE fieldID = ? LIMIT ? OFFSET ?", [fieldID, quantity, (page - 1) * quantity]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of actuator topics of the specified field
 * @param {String} fieldID - id of the field where the actuator is placed
 */
const getAllActuatorTopicsCount = async (fieldID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM actuator WHERE fieldID = ?", [fieldID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Deletes an actuator topic
 * @param {Object} actuator
 * @property {String} topic - actuator's topic name
 * @property {String} fieldID - id of the field where the actuator is placed
 */
const removeActuatorTopic = async (actuator) => {
  const connection = await connect();
  try {
    await query(connection, "DELETE FROM actuator WHERE topic = ? AND fieldID = ?", [actuator.topic, actuator.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Adds a sensor topic
 * @param {Object} actuator
 * @property {String} topic - sensor's topic name
 * @property {String} fieldID - id of the field where the sensor is placed
 */
const addSensorTopic = async (sensor) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO sensor VALUES (?, ?)", [sensor.topic, sensor.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets a sensor topic
 * @param {Object} sensor
 * @property {String} topic - sensor's topic name
 * @property {String} fieldID - id of the field where the sensor is placed
 */
const getSensorTopic = async (sensor) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM sensor WHERE topic = ? AND fieldID = ?", [sensor.topic, sensor.fieldID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * It returns all sensors (necessary for the simulator)
 */
const getAllSensors = async () => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM sensor");
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all sensors topics of the specified field
 * @param {String} fieldID - id of the field where the sensor is placed
 */
const getAllSensorTopics = async (fieldID) => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM sensor WHERE fieldID = ?", [fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all sensor topics of the specified field
 * @param {String} fieldID - id of the field where the sensor is placed
 * @param {String} page - the page to be shown
 * @param {String} quantity - the number of element to be shown in the current page 
 */
const getAllSensorTopicsPaginated = async (fieldID, page, quantity) => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM sensor WHERE fieldID = ? LIMIT ? OFFSET ?", [fieldID, quantity, (page - 1) * quantity]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the number of sensor topics of the specified field
 * @param {String} fieldID - id of the field where the sensor is placed
 */
const getAllSensorTopicsCount = async (fieldID) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT count(*) as count FROM sensor WHERE fieldID = ?", [fieldID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Deletes a sensor topic
 * @param {Object} actuator
 * @property {String} topic - sensor's topic name
 * @property {String} fieldID - id of the field where the sensor is placed
 */
const removeSensorTopic = async (sensor) => {
  const connection = await connect();
  try {
    await query(connection, "DELETE FROM sensor WHERE topic = ? AND fieldID = ?", [sensor.topic, sensor.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Adds a measure
 * @param {Object} measure
 * @property {Number} value - value registered by the sensor
 * @property {String} sensorTopic - name of the sensor topic
 * @property {String} fieldID - id of the field where the sensor is placed
 */
const addMeasure = async (measure) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO measure (value, sensorTopic, fieldID, timestamp) VALUES (?, ?, ?, ?)", [measure.value, measure.sensorTopic, measure.fieldID, new Date()]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all measures of the specified field and topic
 * @param {Object} measure
 * @property {String} topic - the sensor topic
 * @property {String} fieldID - the id of the field where the sensor is placed
 * @property {String} startDate - the start date of the measure
 * @property {String} endDate - the end date of the measure
 */
const getAllMeasures = async (measure) => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM measure WHERE sensorTopic = ? AND fieldID = ? AND timestamp >= ? AND timestamp <= ?", [measure.topic, measure.fieldID, new Date(measure.startDate), new Date(measure.endDate)]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Adds the configuration to an actuator
 * @param {Object} configuration
 */
const addConfiguration = async (configuration) => {
  const connection = await connect();
  try {
    await query(connection, "INSERT INTO configuration VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [configuration.actuatorTopic, configuration.fieldID, configuration.sensorTopic ?? null, configuration.conditionType ?? null, configuration.conditionValue ?? null, configuration.conditionFalse ?? null, configuration.conditionTrue ?? null, true, configuration.startTime ?? null, configuration.endTime ?? null]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates an actuator's configuration
 * @param {Object} configuration 
*/
const updateActiveStateConfiguration = async (configuration) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE configuration SET active = ? WHERE actuatorTopic = ? AND fieldID = ?", [configuration.active, configuration.actuatorTopic, configuration.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Updates the configuration to an actuator
 * @param {Object} configuration
 */
const updateConfiguration = async (configuration) => {
  const connection = await connect();
  try {
    await query(connection, "UPDATE configuration SET sensorTopic = ?, conditionType = ?, conditionValue = ?, conditionFalse = ?, conditionTrue = ?, startTime = ?, endTime = ? WHERE actuatorTopic = ? AND fieldID = ?", [configuration.sensorTopic ?? null, configuration.conditionType ?? null, configuration.conditionValue ?? null, configuration.conditionFalse ?? null, configuration.conditionTrue ?? null, configuration.startTime ?? null, configuration.endTime ?? null, configuration.actuatorTopic, configuration.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets the configuration of an actuator
 * @param {Object} configuration 
 */
const getConfiguration = async (configuration) => {
  const connection = await connect();
  try {
    return (await query(connection, "SELECT * FROM configuration WHERE actuatorTopic = ? AND fieldID = ?", [configuration.actuatorTopic, configuration.fieldID]))[0];
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all the configurations
 */
const getAllConfigurations = async () => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM configuration");
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Gets all configurations of the specified sensor
 * @param {Object} configuration 
 */
const getConfigurationsBySensor = async (configuration) => {
  const connection = await connect();
  try {
    return await query(connection, "SELECT * FROM configuration WHERE sensorTopic = ? AND fieldID = ?", [configuration.sensorTopic, configuration.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

/**
 * Deletes the configuration of an actuator
 * @param {Object} configuration 
 */
const removeConfiguration = async (configuration) => {
  const connection = await connect();
  try {
    await query(connection, "DELETE FROM configuration WHERE actuatorTopic = ? AND fieldID = ?", [configuration.actuatorTopic, configuration.fieldID]);
  } catch (e) {
    throw e;
  } finally {
    disconnect(connection);
  }
};

export {
  prepareInputs,
  truncateAllTables,
  createAdmin,
  createEmployee,
  getUser,
  getUserByEmail,
  getAllEmployees,
  getAllEmployeesPaginated,
  getAllEmployeesCount,
  getAllEmployeesByCompanyID,
  getAllEmployeesByCompanyIDPaginated,
  getAllEmployeesByCompanyIDCount,
  updateUserData,
  updateUserPassword,
  updateUserPasswordAndActivateEmployee,
  deleteUser,
  createCompany,
  getCompany,
  getAllCompanies,
  getAllCompaniesPaginated,
  getAllCompaniesCount,
  updateCompany,
  deleteCompany,
  createField,
  getField,
  getAllFields,
  getAllFieldsPaginated,
  getAllFieldsCount,
  getAllFieldsByAdminID,
  getAllFieldsByAdminIDPaginated,
  getAllFieldsByAdminIDCount,
  updateField,
  deleteField,
  addActuatorTopic,
  getActuatorTopic,
  getAllActuators,
  getAllActuatorTopics,
  getAllActuatorTopicsPaginated,
  getAllActuatorTopicsCount,
  removeActuatorTopic,
  addSensorTopic,
  getSensorTopic,
  getAllSensors,
  getAllSensorTopics,
  getAllSensorTopicsPaginated,
  getAllSensorTopicsCount,
  removeSensorTopic,
  addMeasure,
  getAllMeasures,
  addConfiguration,
  updateActiveStateConfiguration,
  updateConfiguration,
  getConfiguration,
  getAllConfigurations,
  getConfigurationsBySensor,
  removeConfiguration
};