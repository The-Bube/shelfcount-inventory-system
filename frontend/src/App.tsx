import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
  message: string;
};

type Item = {
  id: number;
  serialNumber: string;
  name: string;
  barcode: string;
  category: string;
  expectedQuantity: number;
};

function App() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");
  const [backendMessage, setBackendMessage] = useState<string>(
    "Trying to connect to the backend."
  );

  const [query, setQuery] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [searchMessage, setSearchMessage] = useState<string>(
    "Search by serial number, barcode, item name, or category."
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

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setItems([]);
      setSearchMessage("Enter a serial number, barcode, item name, or category.");
      return;
    }

    setSearchMessage("Searching inventory...");

    fetch(
      `http://localhost:8080/api/items/search?query=${encodeURIComponent(
        trimmedQuery
      )}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Search request failed.");
        }

        return response.json() as Promise<Item[]>;
      })
      .then((data) => {
        setItems(data);

        if (data.length === 0) {
          setSearchMessage("No matching inventory items found.");
        } else {
          setSearchMessage(`${data.length} matching item(s) found.`);
        }
      })
      .catch(() => {
        setItems([]);
        setSearchMessage("Unable to search inventory. Check that the backend is running.");
      });
  }

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

        <section className="search-section">
          <h2>Search Inventory</h2>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              placeholder="Example: BK-10345, Java, notebook"
              onChange={(event) => setQuery(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          <p className="search-message">{searchMessage}</p>

          <div className="item-results">
            {items.map((item) => (
              <article className="item-card" key={item.id}>
                <div>
                  <p className="item-category">{item.category}</p>
                  <h3>{item.name}</h3>
                </div>

                <dl>
                  <div>
                    <dt>Serial Number</dt>
                    <dd>{item.serialNumber}</dd>
                  </div>

                  <div>
                    <dt>Barcode</dt>
                    <dd>{item.barcode}</dd>
                  </div>

                  <div>
                    <dt>Expected Quantity</dt>
                    <dd>{item.expectedQuantity}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;