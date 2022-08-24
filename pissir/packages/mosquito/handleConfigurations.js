import { publishToActuator, subscribeToSensors } from "@pissir/lib/src/mqtt.js";
import { addMeasure, getAllConfigurations, getConfigurationsBySensor } from "@pissir/lib/src/db.js";

const updateActuators = async (configurations, value) => {
  configurations.forEach(configuration => {
    if (configuration.active) {
      const currentTime = new Date().getHours();
      let publish = true
      if (configuration.sensorTopic) {
        publish &= ((configuration.conditionType == "<" &&
        value < configuration.conditionValue) ||
        (configuration.conditionType == ">" &&
        value > configuration.conditionValue));
      }
      publish &= (currentTime > configuration.startTime && currentTime < configuration.endTime);
      if (publish) {
        publishToActuator(configuration.fieldID, configuration.actuatorTopic, {
          value: configuration.conditionTrue
        });
      } else {
        publishToActuator(configuration.fieldID, configuration.actuatorTopic, {
          value: configuration.conditionFalse
        });
      }
    }
  });
};

subscribeToSensors(async (topic, message) => {
  try {
    const topics = topic.split("/");
    const fieldID = topics[1];
    const sensorTopic = topics[3];
    const value = JSON.parse(message.toString()).value;
    await addMeasure({
      value,
      sensorTopic,
      fieldID
    });
    const configurations = await getConfigurationsBySensor({ sensorTopic, fieldID });
    updateActuators(configurations, value);
  } catch (e) {
    console.log(e);
  }
});

setInterval(async () => {
  const configurations = await getAllConfigurations();
  updateActuators(configurations);
}, 60 * 1000);