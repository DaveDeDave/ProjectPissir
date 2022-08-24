import { getAllActuators } from "@pissir/lib/src/db.js";
import { subscribeActuatorChanges, subscribeGetActuatorState } from "@pissir/lib/src/mqtt.js";

let actuatorsState = {};

setInterval(async () => {
  const actuators = await getAllActuators();
  const temp = {};
  actuators.forEach(actuator => {
    const key = `${actuator.fieldID}.${actuator.topic}`; 
    if (actuatorsState[key]) {
      temp[key] = actuatorsState[key];
      delete actuatorsState[key];
    } else {
      temp[key] = { value: 0 };
      const client1 = subscribeActuatorChanges(actuator.fieldID, actuator.topic, (topic, message) => {
        try {
          const value = JSON.parse(message).value;
          actuatorsState[key].value = value;
        } catch(e) {
          console.log(e);
        }
      });
      const client2 = subscribeGetActuatorState(actuator.fieldID, actuator.topic, (topic, message, client) => {
        try {
          client.publish(`pissir/${actuator.fieldID}/actuator/${actuator.topic}`, JSON.stringify({ value: actuatorsState[key].value}));
        } catch(e) {
          console.log(e);
        }
      });
      temp[key].clients = [client1, client2];
    }
  });
  Object.keys(actuatorsState).forEach(key => { actuatorsState[key].clients[0].end(); actuatorsState[key].clients[1].end();  });
  actuatorsState = temp;
}, 5000);