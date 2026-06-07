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

type Location = {
  id: number;
  name: string;
};

type CountEntry = {
  id: number;
  item: Item;
  location: Location;
  quantityFound: number;
  countedAt: string;
};

type CountSummary = {
  itemId: number;
  serialNumber: string;
  itemName: string;
  expectedQuantity: number;
  totalFound: number;
  variance: number;
  status: string;
};

type DashboardSummary = {
  totalItems: number;
  matchedItems: number;
  shortItems: number;
  overItems: number;
  notCountedItems: number;
};

function App() {
  const [backendStatus, setBackendStatus] =
    useState<string>("Checking...");

  const [backendMessage, setBackendMessage] = useState<string>(
    "Trying to connect to the backend."
  );

  const [query, setQuery] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);

  const [searchMessage, setSearchMessage] = useState<string>(
    "Search by serial number, barcode, item name, or category."
  );

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [selectedLocationId, setSelectedLocationId] =
    useState<string>("");

  const [quantityFound, setQuantityFound] = useState<string>("");
  const [countEntries, setCountEntries] = useState<CountEntry[]>([]);

  const [countSummary, setCountSummary] =
    useState<CountSummary | null>(null);

  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);

  const [countMessage, setCountMessage] = useState<string>(
    "Select an item to begin recording counts."
  );

  function loadDashboardSummary() {
    fetch("http://localhost:8080/api/dashboard/summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load dashboard summary.");
        }

        return response.json() as Promise<DashboardSummary>;
      })
      .then((data) => {
        setDashboardSummary(data);
      })
      .catch(() => {
        setDashboardSummary(null);
      });
  }

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

    fetch("http://localhost:8080/api/locations")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load locations.");
        }

        return response.json() as Promise<Location[]>;
      })
      .then((data) => {
        setLocations(data);
      })
      .catch(() => {
        setCountMessage("Unable to load store locations.");
      });

    loadDashboardSummary();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setItems([]);
      setSelectedItem(null);
      setSearchMessage(
        "Enter a serial number, barcode, item name, or category."
      );
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
        setSelectedItem(null);
        setCountEntries([]);
        setCountSummary(null);

        if (data.length === 0) {
          setSearchMessage("No matching inventory items found.");
        } else {
          setSearchMessage(`${data.length} matching item(s) found.`);
        }
      })
      .catch(() => {
        setItems([]);
        setSearchMessage(
          "Unable to search inventory. Check that the backend is running."
        );
      });
  }

  function loadItemCountData(item: Item) {
    setSelectedItem(item);
    setSelectedLocationId("");
    setQuantityFound("");
    setCountMessage(`Recording counts for ${item.name}.`);

    fetch(`http://localhost:8080/api/items/${item.id}/count-entries`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load count entries.");
        }

        return response.json() as Promise<CountEntry[]>;
      })
      .then((data) => {
        setCountEntries(data);
      })
      .catch(() => {
        setCountEntries([]);
      });

    fetch(`http://localhost:8080/api/items/${item.id}/count-summary`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load count summary.");
        }

        return response.json() as Promise<CountSummary>;
      })
      .then((data) => {
        setCountSummary(data);
      })
      .catch(() => {
        setCountSummary(null);
      });
  }

  function handleCountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedItem) {
      setCountMessage("Select an inventory item first.");
      return;
    }

    if (!selectedLocationId) {
      setCountMessage("Select a store location.");
      return;
    }

    const parsedQuantity = Number(quantityFound);

    if (
      quantityFound.trim() === "" ||
      Number.isNaN(parsedQuantity) ||
      parsedQuantity < 0 ||
      !Number.isInteger(parsedQuantity)
    ) {
      setCountMessage("Enter a valid whole-number quantity.");
      return;
    }

    setCountMessage("Saving count...");

    fetch("http://localhost:8080/api/count-entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: selectedItem.id,
        locationId: Number(selectedLocationId),
        quantityFound: parsedQuantity,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to save count.");
        }

        return response.json() as Promise<CountEntry>;
      })
      .then(() => {
        const currentItem = selectedItem;

        setQuantityFound("");
        setSelectedLocationId("");
        setCountMessage("Count saved successfully.");

        loadItemCountData(currentItem);
        loadDashboardSummary();
      })
      .catch(() => {
        setCountMessage("Unable to save the count.");
      });
  }

  return (
    <main className="app">
      <section className="hero-card">
        <p className="eyebrow">ShelfCount Inventory System</p>

        <h1>Bookstore Inventory Counting Made Faster</h1>

        <p className="description">
          Search items by serial number, record physical counts by location,
          and compare total counted stock against the expected quantity on
          hand.
        </p>

        <div className="status-card">
          <span
            className={
              backendStatus === "running"
                ? "status-dot status-online"
                : "status-dot status-offline"
            }
          />

          <div>
            <h2>Backend Status: {backendStatus}</h2>
            <p>{backendMessage}</p>
          </div>
        </div>

        {dashboardSummary && (
          <section className="dashboard-section">
            <h2>Inventory Dashboard</h2>

            <div className="dashboard-grid">
              <article className="dashboard-card">
                <span>Total Items</span>
                <strong>{dashboardSummary.totalItems}</strong>
              </article>

              <article className="dashboard-card">
                <span>Matched</span>
                <strong>{dashboardSummary.matchedItems}</strong>
              </article>

              <article className="dashboard-card">
                <span>Short</span>
                <strong>{dashboardSummary.shortItems}</strong>
              </article>

              <article className="dashboard-card">
                <span>Over</span>
                <strong>{dashboardSummary.overItems}</strong>
              </article>

              <article className="dashboard-card">
                <span>Not Counted</span>
                <strong>{dashboardSummary.notCountedItems}</strong>
              </article>
            </div>
          </section>
        )}

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

                <button
                  type="button"
                  onClick={() => loadItemCountData(item)}
                >
                  Record Count
                </button>
              </article>
            ))}
          </div>
        </section>

        {selectedItem && (
          <section className="count-section">
            <h2>Record Physical Count</h2>

            <h3>{selectedItem.name}</h3>

            <p>
              Serial number: <strong>{selectedItem.serialNumber}</strong>
            </p>

            <form className="count-form" onSubmit={handleCountSubmit}>
              <label>
                Location
                <select
                  value={selectedLocationId}
                  onChange={(event) =>
                    setSelectedLocationId(event.target.value)
                  }
                >
                  <option value="">Select a location</option>

                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity found
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantityFound}
                  onChange={(event) =>
                    setQuantityFound(event.target.value)
                  }
                />
              </label>

              <button type="submit">Save Count</button>
            </form>

            <p>{countMessage}</p>

            {countSummary && (
              <div className="count-summary">
                <h3>Count Summary</h3>

                <p>
                  Expected quantity:{" "}
                  <strong>{countSummary.expectedQuantity}</strong>
                </p>

                <p>
                  Total found: <strong>{countSummary.totalFound}</strong>
                </p>

                <p>
                  Variance: <strong>{countSummary.variance}</strong>
                </p>

                <p>
                  Status: <strong>{countSummary.status}</strong>
                </p>
              </div>
            )}

            <div className="count-entries">
              <h3>Counts by Location</h3>

              {countEntries.length === 0 ? (
                <p>No counts have been recorded for this item.</p>
              ) : (
                countEntries.map((entry) => (
                  <div key={entry.id}>
                    <strong>{entry.location.name}</strong>:{" "}
                    {entry.quantityFound}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;