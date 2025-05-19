import opcua from "node-opcua";
import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import { Server as socketIo } from "socket.io";
import {
  connectToOPCUAServer,
  createSession,
  moveRight,
  moveLeft,
  moveUp,
  moveDown,
  openClaw,
  closeClaw,
  sensors,
  nodeIdToSensor,
  readAllSensors,
} from "./service.js";

// === OPC UA Setup ===
const endpointUrl = process.env.OPCUA_ENDPOINT;

// === Server Setup ===
const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// === OPC UA Client Initialization ===
const client = await connectToOPCUAServer();
let session, subscription;

(async () => {
  try {
    await client.connect(endpointUrl);

    session = await createSession(client);
    console.log("✅ OPC UA session created");

    // Create subscription
    subscription = opcua.ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 10,
      publishingEnabled: true,
      priority: 10,
    });

    subscription
      .on("started", () => console.log("📡 Subscription started"))
      .on("keepalive", () => console.log("📶 Keepalive"))
      .on("terminated", () => console.log("🛑 Subscription terminated"));

    // Define nodes to monitor
    const nodesToMonitor = [
      { nodeId: sensors.I1, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I2, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I3, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I4, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I5, attributeId: opcua.AttributeIds.Value },
      { nodeId: sensors.I6, attributeId: opcua.AttributeIds.Value },
    ];

    // Monitor each node
    for (const node of nodesToMonitor) {
      const monitoredItem = await subscription.monitor(
        node,
        { samplingInterval: 500, discardOldest: true, queueSize: 10 },
        opcua.TimestampsToReturn.Both
      );

      monitoredItem.on("changed", (dataValue) => {
        const value = dataValue.value.value;
        const sensor = nodeIdToSensor[node.nodeId] || node.nodeId;
        console.log(`📥 Sensor ${sensor} updated:`, value);

        // Emit to all connected clients
        io.emit("sensorUpdate", { sensor, value });
      });
    }
  } catch (err) {
    console.error("❌ OPC UA Error:", err);
  }
})();

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A client connected");

  // Automatically read all sensors and send initial data to the client
  (async () => {
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
        value: dataValue.value.value, // check what is the value
      }));

      // Emit initial sensor data to the newly connected client
      socket.emit("sensorData", sensorData);
    } catch (error) {
      console.error("Error reading sensors on connection:", error);
      socket.emit("sensorDataError", {
        error: "Failed to read initial sensors",
      });
    }
  })();

  // Handle control commands (e.g., move-right, move-left)
  socket.on("control", async (data) => {
    const { action } = data;
    console.log("Control command received:", action);

    try {
      switch (action) {
        case "move-left":
          await moveLeft(session);
          socket.emit("controlResponse", { success: true, action });
          // io.emit("sensorUpdate", {
          //   sensor: "I1",
          //   value: true,
          // });
          break;
        case "move-right":
          await moveRight(session);
          socket.emit("controlResponse", { success: true, action });
          // io.emit("sensorUpdate", {
          //   sensor: "I2",
          //   value: true,
          // });
          break;
        case "move-up":
          await moveUp(session);
          socket.emit("controlResponse", { success: true, action });
          // io.emit("sensorUpdate", {
          //   sensor: "I3",
          //   value: true,
          // });
          break;
        case "move-down":
          await moveDown(session);
          socket.emit("controlResponse", { success: true, action });
          // io.emit("sensorUpdate", {
          //   sensor: "I4",
          //   value: true,
          // });
          break;
        case "open-claw":
          await openClaw(session);
          socket.emit("controlResponse", { success: true, action });
          // io.emit("sensorUpdate", {
          //   sensor: "I5",
          //   value: true,
          // });
          break;
        case "close-claw":
          await closeClaw(session);
          socket.emit("controlResponse", { success: true, action });
          // io.emit("sensorUpdate", {
          //   sensor: "I6",
          //   value: true,
          // });
          break;
        default:
          socket.emit("controlResponse", {
            success: false,
            error: "Invalid action",
          });
      }
    } catch (error) {
      console.error("Error processing control command:", error);
      socket.emit("controlResponse", {
        success: false,
        error: "Internal server error",
      });
    }
  });

  // // Handle request to read all sensors
  // socket.on("readAllSensors", async () => {
  //   try {
  //     const nodesToRead = [
  //       { nodeId: sensors.I1, attributeId: opcua.AttributeIds.Value },
  //       { nodeId: sensors.I2, attributeId: opcua.AttributeIds.Value },
  //       { nodeId: sensors.I3, attributeId: opcua.AttributeIds.Value },
  //       { nodeId: sensors.I4, attributeId: opcua.AttributeIds.Value },
  //       { nodeId: sensors.I5, attributeId: opcua.AttributeIds.Value },
  //       { nodeId: sensors.I6, attributeId: opcua.AttributeIds.Value },
  //     ];

  //     const dataValues = await session.read(nodesToRead);

  //     // Format the response
  //     const sensorData = dataValues.map((dataValue, index) => ({
  //       sensor: `I${index + 1}`,
  //       value: dataValue.value.value,
  //     }));

  //     socket.emit("sensorData", sensorData);
  //   } catch (error) {
  //     console.error("Error reading sensors:", error);
  //     socket.emit("sensorDataError", { error: "Failed to read sensors" });
  //   }
  // });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  if (subscription) {
    await subscription.terminate();
    console.log("✅ OPC UA subscription terminated");
  }
  if (session) {
    await session.close();
    console.log("✅ OPC UA session closed");
  }
  if (client) {
    await client.disconnect();
    console.log("✅ OPC UA client disconnected");
  }

  io.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});

// === Start Server ===
server.listen(process.env.API_PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.API_PORT}`);
});

app.get("/api/control/:action", async (req, res) => {
  const action = req.params.action;
  console.log("Requested action:", action);

  switch (action) {
    case "move-right":
      return await moveRight(res, session);
    case "move-left":
      return await moveLeft(res, session);
    case "move-up":
      return await moveUp(res, session);
    case "move-down":
      return await moveDown(res, session);
    case "open-claw":
      return await openClaw(res, session);
    case "close-claw":
      return await closeClaw(res, session);
    default:
      return res.status(400).json({ error: "Invalid movement type" });
  }
});

app.get("/api/read/all", async (req, res) => {
  return await readAllSensors(session);
});
