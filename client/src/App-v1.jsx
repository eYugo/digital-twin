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

  const [horizontalSensor, setHorizontalSensor] = useState(false);
  const [verticalSensor, setVerticalSensor] = useState(false);
  const [clawSensor, setClawSensor] = useState(false);
  const [socket, setSocket] = useState(null);
  // Initialize WebSocket connection

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL); // Connect to the WebSocket server
    setSocket(newSocket);

    // Listen for initial sensor data
    newSocket.on("sensorData", (data) => {
      console.log("Initial sensor data received:", data);
      data.forEach((sensorData) => {
        if (sensorData.sensor === "I2" && sensorData.value === false) {
          if (isLoaded) {
            setHorizontalSensor(false);
            sendMessage("Mobile parts", "DirectionController", "left");
          }
        }
        if (sensorData.sensor === "I2" && sensorData.value === true) {
          if (isLoaded) {
            setHorizontalSensor(true);
            sendMessage("Mobile parts", "DirectionController", "right");
          }
        }
        if (sensorData.sensor === "I4" && sensorData.value === false) {
          if (isLoaded) {
            setVerticalSensor(false);
            sendMessage("Vertical", "DirectionController", "down");
          }
        }
        if (sensorData.sensor === "I4" && sensorData.value === true) {
          if (isLoaded) {
            setVerticalSensor(true);
            sendMessage("Vertical", "DirectionController", "up");
          }
        }
        if (sensorData.sensor === "I6" && sensorData.value === false) {
          if (isLoaded) {
            setClawSensor(false);
            sendMessage("Pivot 1", "HookController", "close");
            sendMessage("Pivot 2", "HookController", "close");
          }
        }
        if (sensorData.sensor === "I6" && sensorData.value === true) {
          if (isLoaded) {
            setClawSensor(true);
            sendMessage("Pivot 1", "HookController", "open");
            sendMessage("Pivot 2", "HookController", "open");
          }
        }
      });
    });

    // Listen for real-time sensor updates
    newSocket.on("sensorUpdate", (data) => {
      if (data.sensor === "I2" && data.value === false) {
        if (isLoaded) {
          setHorizontalSensor(false);
          sendMessage("Mobile parts", "DirectionController", "left");
        }
      }
      if (data.sensor === "I2" && data.value === true) {
        if (isLoaded) {
          setHorizontalSensor(true);
          sendMessage("Mobile parts", "DirectionController", "right");
        }
      }
      if (data.sensor === "I4" && data.value === false) {
        setVerticalSensor(false);
        sendMessage("Vertical", "DirectionController", "down");
      }
      if (data.sensor === "I4" && data.value === true) {
        setVerticalSensor(true);
        sendMessage("Vertical", "DirectionController", "up");
      }
      if (data.sensor === "I6" && data.value === false) {
        setClawSensor(false);
        sendMessage("Pivot 1", "HookController", "close");
        sendMessage("Pivot 2", "HookController", "close");
      }
      if (data.sensor === "I6" && data.value === true) {
        setClawSensor(true);
        sendMessage("Pivot 1", "HookController", "open");
        sendMessage("Pivot 2", "HookController", "open");
      }
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isLoaded, sendMessage]);

  const isOpen = clawSensor === true;
  const isLeft = horizontalSensor === false;
  const isUp = verticalSensor === true;

  const handleHookButtonClick = () => {
    sendMessage("Pivot 1", "HookController", isOpen ? "close" : "open");
    sendMessage("Pivot 2", "HookController", isOpen ? "close" : "open");

    socket.emit("control", {
      action: isOpen ? "close-claw" : "open-claw",
    });
    setClawSensor(isOpen ? false : true);
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
    setHorizontalSensor(isLeft ? true : false);
  };

  const handleVerticalClick = () => {
    sendMessage("Vertical", "DirectionController", isUp ? "down" : "up");

    socket.emit("control", {
      action: isUp ? "move-down" : "move-up",
    });
    setVerticalSensor(isUp ? false : true);
  };

  const handleSyncPositionClick = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/read/all`
      );
      const data = await response.json();
      console.log("Data fetched:", data);
      data.forEach((sensorData) => {
        if (sensorData.sensor === "I2" && sensorData.value === false) {
          if (isLoaded) {
            setHorizontalSensor(false);
            sendMessage("Mobile parts", "DirectionController", "left");
          }
        }
        if (sensorData.sensor === "I2" && sensorData.value === true) {
          if (isLoaded) {
            setHorizontalSensor(true);
            sendMessage("Mobile parts", "DirectionController", "right");
          }
        }
        if (sensorData.sensor === "I4" && sensorData.value === false) {
          if (isLoaded) {
            setVerticalSensor(false);
            sendMessage("Vertical", "DirectionController", "down");
          }
        }
        if (sensorData.sensor === "I4" && sensorData.value === true) {
          if (isLoaded) {
            setVerticalSensor(true);
            sendMessage("Vertical", "DirectionController", "up");
          }
        }
        if (sensorData.sensor === "I6" && sensorData.value === false) {
          if (isLoaded) {
            setClawSensor(false);
            sendMessage("Pivot 1", "HookController", "close");
            sendMessage("Pivot 2", "HookController", "close");
          }
        }
        if (sensorData.sensor === "I6" && sensorData.value === true) {
          if (isLoaded) {
            setClawSensor(true);
            sendMessage("Pivot 1", "HookController", "open");
            sendMessage("Pivot 2", "HookController", "open");
          }
        }
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
              <Button
                onClick={handleSyncPositionClick}
                variant="secondary"
                className="mx-4 px-5 "
              >
                Sync Position
              </Button>
              <h3>Sensor Data</h3>
              <ul>
                <li key="2">Horizontal sensor: {horizontalSensor}</li>
                <li key="4">Vertical sensor: {verticalSensor}</li>
                <li key="6">Claw sensor: {clawSensor}</li>
              </ul>
            </Col>
          </Row>
        </Fragment>
      </Container>
    </ErrorBoundary>
  );
}

export default App;
