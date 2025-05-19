import { Fragment, useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Card, Row, Col, Container, Button } from "react-bootstrap";
import { io } from "socket.io-client";

import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const { unityProvider, loadingProgression, isLoaded, sendMessage } =
    useUnityContext({
      loaderUrl: "unityBuild/Build/unityBuild.loader.js",
      dataUrl: "unityBuild/Build/unityBuild.data",
      frameworkUrl: "unityBuild/Build/unityBuild.framework.js",
      codeUrl: "unityBuild/Build/unityBuild.wasm",
    });

  const [horizontalSensor, setHorizontalSensor] = useState("I1");
  const [verticalSensor, setVerticalSensor] = useState("I3");
  const [clawSensor, setClawSensor] = useState("I5");
  const [socket, setSocket] = useState(null);
  // Initialize WebSocket connection

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL); // Connect to the WebSocket server
    setSocket(newSocket);

    // Listen for initial sensor data
    newSocket.on("sensorData", (data) => {
      console.log("Initial sensor data received:", data);
      data.forEach((sensorData) => {
        if (sensorData.sensor === "I1" && sensorData.value) {
          setHorizontalSensor("I1");
          if (isLoaded)
            sendMessage("Mobile parts", "DirectionController", "left");
        }
        if (sensorData.sensor === "I2" && sensorData.value) {
          setHorizontalSensor("I2");
          if (isLoaded)
            sendMessage("Mobile parts", "DirectionController", "right");
        }
        if (sensorData.sensor === "I3" && sensorData.value) {
          setVerticalSensor("I3");
          if (isLoaded) sendMessage("Vertical", "DirectionController", "up");
        }
        if (sensorData.sensor === "I4" && sensorData.value) {
          setVerticalSensor("I4");
          if (isLoaded) sendMessage("Vertical", "DirectionController", "down");
        }
        if (sensorData.sensor === "I5" && sensorData.value) {
          setClawSensor("I5");
          if (isLoaded) {
            sendMessage("Pivot 1", "HookController", "open");
            sendMessage("Pivot 2", "HookController", "open");
          }
        }
        if (sensorData.sensor === "I6" && sensorData.value) {
          setClawSensor("I6");
          if (isLoaded) {
            sendMessage("Pivot 1", "HookController", "close");
            sendMessage("Pivot 2", "HookController", "close");
          }
        }
      });
    });

    // Listen for real-time sensor updates
    newSocket.on("sensorUpdate", (data) => {
      console.log(
        "Loading Progression (inside new socket): ",
        loadingProgression
      );
      console.log("Is Loaded (inside new socket):", isLoaded);
      console.log(`Sensor ${data.sensor} updated:`, data.value);
      if (data.sensor === "I1" && data.value) {
        if (isLoaded) {
          setHorizontalSensor("I1");
          sendMessage("Mobile parts", "DirectionController", "left");
        }
      }
      if (data.sensor === "I2" && data.value) {
        if (isLoaded) {
          setHorizontalSensor("I2");
          sendMessage("Mobile parts", "DirectionController", "right");
        }
      }
      if (data.sensor === "I3" && data.value) {
        setVerticalSensor("I3");
        sendMessage("Vertical", "DirectionController", "up");
      }
      if (data.sensor === "I4" && data.value) {
        setVerticalSensor("I4");
        sendMessage("Vertical", "DirectionController", "down");
      }
      if (data.sensor === "I5" && data.value) {
        setClawSensor("I5");
        sendMessage("Pivot 1", "HookController", "open");
        sendMessage("Pivot 2", "HookController", "open");
      }
      if (data.sensor === "I6" && data.value) {
        setClawSensor("I6");
        sendMessage("Pivot 1", "HookController", "close");
        sendMessage("Pivot 2", "HookController", "close");
      }
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isLoaded, sendMessage]);

  const isOpen = clawSensor === "I5";
  const isLeft = horizontalSensor === "I1";
  const isUp = verticalSensor === "I3";

  const handleHookButtonClick = () => {
    sendMessage("Pivot 1", "HookController", isOpen ? "close" : "open");
    sendMessage("Pivot 2", "HookController", isOpen ? "close" : "open");

    socket.emit("control", {
      action: isOpen ? "close-claw" : "open-claw",
    });
    setClawSensor(isOpen ? "I6" : "I5");
  };

  const handleHorizontalClick = () => {
    sendMessage(
      "Mobile parts",
      "DirectionController",
      isLeft ? "right" : "left"
    );

    socket.emit("control", {
      action: isLeft ? "move-right" : "move-left",
    });
    setHorizontalSensor(isLeft ? "I2" : "I1");
  };

  const handleVerticalClick = () => {
    sendMessage("Vertical", "DirectionController", isUp ? "down" : "up");

    socket.emit("control", {
      action: isUp ? "move-down" : "move-up",
    });
    setVerticalSensor(isUp ? "I4" : "I3");
  };

  return (
    <ErrorBoundary>
      <Container
        fluid
        className="text-center bg-dark text-light d-flex flex-column justify-content-center min-vh-100"
      >
        <h1 className="display-4 mb-4">Digital Twin</h1>
        <Fragment>
          {!isLoaded && (
            <p className="lead text-warning mb-4">
              Loading Application... {Math.round(loadingProgression * 100)}%
            </p>
          )}
          <Row className="d-flex align-items-stretch">
            <Card bg="dark" text="light" className="flex-fill">
              <Card.Body className="d-flex flex-column">
                <Card.Title>3D Model</Card.Title>
                <Unity
                  unityProvider={unityProvider}
                  style={{
                    visibility: isLoaded ? "visible" : "hidden",
                    width: "100%",
                    height: "50vh",
                  }}
                  className="border border-secondary rounded flex-grow-1"
                />
              </Card.Body>
            </Card>
          </Row>
          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Button
                onClick={handleHookButtonClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                {isOpen ? "Close" : "Open"}
              </Button>
              <Button
                onClick={handleHorizontalClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                {isLeft ? "Right" : "Left"}
              </Button>
              <Button
                onClick={handleVerticalClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                {isUp ? "Down" : "Up"}
              </Button>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <h3>Sensor Data</h3>
              <ul>
                <li key="1&2">Horizontal sensor: {horizontalSensor}</li>
                <li key="3&4">Vertical sensor: {verticalSensor}</li>
                <li key="5&6">Claw sensor: {clawSensor}</li>
              </ul>
            </Col>
          </Row>
        </Fragment>
      </Container>
    </ErrorBoundary>
  );
}

export default App;
