import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
  message: string;
};

function App() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");
  const [backendMessage, setBackendMessage] = useState<string>(
    "Trying to connect to the backend."
  );

  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend response was not successful.");
        }

        return response.json() as Promise<HealthResponse>;
      })
      .then((data) => {
        setBackendStatus(data.status);
        setBackendMessage(data.message);
      })
      .catch(() => {
        setBackendStatus("offline");
        setBackendMessage(
          "Frontend is running, but the backend is not currently reachable."
        );
      });
  }, []);

  return (
    <main className="app">
      <section className="hero-card">
        <p className="eyebrow">ShelfCount Inventory System</p>

        <h1>Bookstore Inventory Counting Made Faster</h1>

        <p className="description">
          Search items by serial number, record physical counts by location, and
          compare total counted stock against the expected quantity on hand.
        </p>

        <div className="status-card">
          <span
            className={
              backendStatus === "running"
                ? "status-dot status-online"
                : "status-dot status-offline"
            }
          ></span>

          <div>
            <h2>Backend Status: {backendStatus}</h2>
            <p>{backendMessage}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;