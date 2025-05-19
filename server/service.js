import opcua from "node-opcua";
// Actuator and sensor dictionaries

const actuators = {
  O1: 'ns=3;s="O1"',
  O2: 'ns=3;s="O2"',
  O3: 'ns=3;s="O3"',
  O4: 'ns=3;s="O4"',
  O5: 'ns=3;s="O5"',
  O6: 'ns=3;s="O6"',
};

export const sensors = {
  I1: 'ns=3;s="I1"',
  I2: 'ns=3;s="I2"',
  I3: 'ns=3;s="I3"',
  I4: 'ns=3;s="I4"',
  I5: 'ns=3;s="I5"',
  I6: 'ns=3;s="I6"',
};
export function connectToOPCUAServer(endpointUrl) {
  return new Promise((resolve, reject) => {
    const client = opcua.OPCUAClient.create();

    client.connect(endpointUrl, (err) => {
      if (err) {
        console.error("Error connecting to OPC UA server:", err);
        reject(err);
      } else {
        console.log("Connected to OPC UA server");
        resolve(client);
      }
    });
  });
}

export function createSession(client) {
  return new Promise((resolve, reject) => {
    client.createSession((err, session) => {
      if (err) {
        console.error("Error creating OPC UA session:", err);
        reject(err);
      } else {
        console.log("OPC UA session created");
        resolve(session);
      }
    });
  });
}

async function tryWriteNodes(session, res, nodesToWrite, operationName) {
  try {
    const statusCodes = await session.write(nodesToWrite);
    if (statusCodes[0].isGood()) {
      console.log("Write successful!");
      return res.status(200).json({ message: `${operationName} successful` });
    } else {
      console.error("Write failed. Status Code: ", statusCodes[0].toString());
      return res.status(500).json({
        error: `${operationName} failed`,
        statusCode: statusCodes[0].toString(),
      });
    }
  } catch (error) {
    console.error(`Error during ${operationName}:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function moveRight(res, session) {
  console.log("Moving right");
  const nodesToWrite = [
    {
      nodeId: actuators.O1, // NodeId of the variable
      attributeId: opcua.AttributeIds.Value, // Write to the Value attribute
      value: {
        value: {
          dataType: opcua.DataType.Boolean, // Data type of the variable
          value: true, // The value to write
        },
      },
    },
    {
      nodeId: actuators.O2, // NodeId of the variable
      attributeId: opcua.AttributeIds.Value, // Write to the Value attribute
      value: {
        value: {
          dataType: opcua.DataType.Boolean, // Data type of the variable
          value: false, // The value to write
        },
      },
    },
  ];
  const response = await tryWriteNodes(
    session,
    res,
    nodesToWrite,
    "Move Right"
  );
  return response;
}
export async function moveLeft(res, session) {
  console.log("Moving left");
  const nodesToWrite = [
    {
      nodeId: actuators.O2,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O1,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Move Left");
  return response;
}
export async function moveUp(res, session) {
  console.log("Moving up");
  const nodesToWrite = [
    {
      nodeId: actuators.O4,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O3,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Move Up");
  return response;
}
export async function moveDown(res, session) {
  console.log("Moving down");
  const nodesToWrite = [
    {
      nodeId: actuators.O3,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O4,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Move Down");
  return response;
}
export async function openClaw(res, session) {
  console.log("Opening claw");
  const nodesToWrite = [
    {
      nodeId: actuators.O5,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O6,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(session, res, nodesToWrite, "Open Claw");
}
export async function closeClaw(res, session) {
  console.log("Closing claw");
  const nodesToWrite = [
    {
      nodeId: actuators.O6,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: true,
        },
      },
    },
    {
      nodeId: actuators.O5,
      attributeId: opcua.AttributeIds.Value,
      value: {
        value: {
          dataType: opcua.DataType.Boolean,
          value: false,
        },
      },
    },
  ];
  const response = await tryWriteNodes(
    session,
    res,
    nodesToWrite,
    "Close Claw"
  );
  return response;
}

export async function readAllSensors(session, res) {
  try {
    const nodesToRead = [
      { nodeId: sensors.I1, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I2, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I3, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I4, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I5, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I6, attributeId: opcua.AttributeIds.Value },
    ];

    const dataValues = await session.read(nodesToRead);

    // Format the response
    const sensorData = dataValues.map((dataValue, index) => ({
      sensor: `I${index + 1}`,
      value: dataValue.value.value,
    }));

    return res.status(200).json(sensorData);
  } catch (error) {
    console.error("Error reading sensors:", error);
    return res.status(500).json({ error: "Failed to read sensors" });
  }
}

export const nodeIdToSensor = Object.fromEntries(
  Object.entries(sensors).map(([key, value]) => [value, key])
);
