export function handleSensorData(
  sensorData,
  isLoaded,
  setHorizontalSensor,
  setVerticalSensor,
  setClawSensor,
  sendMessage
) {
  if (sensorData.sensor === "I2") {
    if (isLoaded) {
      setHorizontalSensor(sensorData.value);
      sendMessage(
        "Mobile parts",
        "DirectionController",
        sensorData.value ? "right" : "left"
      );
    }
  }
  if (sensorData.sensor === "I4") {
    if (isLoaded) {
      setVerticalSensor(sensorData.value);
      sendMessage(
        "Vertical",
        "DirectionController",
        sensorData.value ? "up" : "down"
      );
    }
  }
  if (sensorData.sensor === "I6") {
    if (isLoaded) {
      setClawSensor(sensorData.value);
      sendMessage(
        "Pivot 1",
        "HookController",
        sensorData.value ? "open" : "close"
      );
      sendMessage(
        "Pivot 2",
        "HookController",
        sensorData.value ? "open" : "close"
      );
    }
  }
}
