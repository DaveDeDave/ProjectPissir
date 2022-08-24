import mqtt from "mqtt";

/**
 * It will notify the actuator to change state
 */
const publishToActuator = (fieldID, topic, message) => {
  const client = mqtt.connect(process.env.MQTT_URI);
  client.on("connect", function() {
    client.publish(`pissir/${fieldID}/actuator/${topic}`, JSON.stringify(message));
    client.end();
  });
};

/**
 * It will get all the sensors measures
 */
const subscribeToSensors = (callback) => {
  const client = mqtt.connect(process.env.MQTT_URI);
  client.on("connect", function() {
    client.subscribe("pissir/+/sensor/#", function(err) {
      if (err) console.log(err);
    });
  });
  client.on("message", callback);
  return client;
};

/**
 * It publish the measure of the specified sensor
 */
const publishSensorMeasure = (fieldID, topic, value) => {
  const client = mqtt.connect(process.env.MQTT_URI);
  client.on("connect", function() {
    client.publish(`pissir/${fieldID}/sensor/${topic}`, JSON.stringify({ value }));
    client.end();
  });
};

/**
 * It will request the specified actuator state 
 */
 const getActuatorState = (fieldID, topic) => {
  const client = mqtt.connect(process.env.MQTT_URI);
  client.on("connect", function() {
    client.publish(`pissir/${fieldID}/actuator/${topic}/getState`, "");
    client.end();
  });
};

/**
 * Notify if the specified actuator change state
 */
const subscribeActuatorChanges = (fieldID, topic, callback) => {
  const client = mqtt.connect(process.env.MQTT_URI);
  client.on("connect", function() {
    client.subscribe(`pissir/${fieldID}/actuator/${topic}`, function(err) {
      if (err) console.log(err);
    });
  });
  client.on("message", callback);
  return client;
};

/**
 * Notify if it is requested the actuator state
 */
const subscribeGetActuatorState = (fieldID, topic, callback) => {
  const client = mqtt.connect(process.env.MQTT_URI);
  client.on("connect", function() {
    client.subscribe(`pissir/${fieldID}/actuator/${topic}/getState`, function(err) {
      if (err) console.log(err);
    })
  });
  client.on("message", (topic, message) => callback(topic, message, client));
  return client;
};

export { publishToActuator, subscribeToSensors, publishSensorMeasure, getActuatorState, subscribeActuatorChanges, subscribeGetActuatorState };