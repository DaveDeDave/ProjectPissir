import { getAllSensors } from "@pissir/lib/src/db.js";
import { publishSensorMeasure } from "@pissir/lib/src/mqtt.js";

const getValue = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

setInterval(async () => {
  const sensors = await getAllSensors();
  await Promise.all(sensors.map(sensor => {
    const value = getValue(0, 20);
    publishSensorMeasure(sensor.fieldID, sensor.topic, value);
  }));
}, 60 * 3000);