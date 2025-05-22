import { Fragment, useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Card, Row, Col, Container, Button } from "react-bootstrap";
import { io } from "socket.io-client";
import { handleSensorData } from "./utils";

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
        handleSensorData(
          sensorData,
          isLoaded,
          setHorizontalSensor,
          setVerticalSensor,
          setClawSensor,
          sendMessage
        );
      });
    });

    // Listen for real-time sensor updates
    newSocket.on("sensorUpdate", (sensorUpdatedData) => {
      handleSensorData(
        sensorUpdatedData,
        isLoaded,
        setHorizontalSensor,
        setVerticalSensor,
        setClawSensor,
        sendMessage
      );
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isLoaded, sendMessage]);

  const isOpen = clawSensor;
  const isRight = horizontalSensor;
  const isUp = verticalSensor;

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
      isRight ? "left" : "right"
    );

    socket.emit("control", {
      action: isRight ? "move-left" : "move-right",
    });
    setHorizontalSensor(isRight ? false : true);
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
        handleSensorData(
          sensorData,
          isLoaded,
          setHorizontalSensor,
          setVerticalSensor,
          setClawSensor,
          sendMessage
        );
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
            <Col md={6} className="mb-4 d-flex">
              <Card bg="dark" text="light" className="flex-fill">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Digital Model 3D</Card.Title>
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
            </Col>
            <Col md={6} className="mb-4 d-flex">
              <Card bg="dark" text="light" className="flex-fill">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Live Stream</Card.Title>
                  <iframe
                    src="https://player.twitch.tv/?channel=gaules&parent=localhost"
                    width="100%"
                    height="50vh"
                    className="border rounded flex-grow-1"
                  ></iframe>
                </Card.Body>
              </Card>
            </Col>
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
                {isRight ? "Left" : "Right"}
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
            </Col>
          </Row>
        </Fragment>
      </Container>
    </ErrorBoundary>
  );
}

export default App;
