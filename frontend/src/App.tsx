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

type InventorySession = {
  id: number;
  name: string;
  status: string;
  createdAt: string;
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

  const [locations, setLocations] = useState<Location[]>([]);

  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [newSessionName, setNewSessionName] = useState<string>("");
  const [sessionMessage, setSessionMessage] = useState<string>(
    "Select or create an inventory session."
  );

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [quantityFound, setQuantityFound] = useState<string>("");
  const [countEntries, setCountEntries] = useState<CountEntry[]>([]);

  const [countSummary, setCountSummary] = useState<CountSummary | null>(null);

  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);

  const [countMessage, setCountMessage] = useState<string>(
    "Select an item to begin recording counts."
  );

  const [resetMessage, setResetMessage] = useState<string>("");

  function loadDashboardSummary(sessionId: number) {
    fetch(
      `http://localhost:8080/api/inventory-sessions/${sessionId}/dashboard/summary`
    )
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

  function loadSessions() {
    fetch("http://localhost:8080/api/inventory-sessions")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load inventory sessions.");
        }

        return response.json() as Promise<InventorySession[]>;
      })
      .then((data) => {
        setSessions(data);

        if (data.length === 0) {
          setActiveSessionId(null);
          setDashboardSummary(null);
          setSessionMessage("No sessions found. Create a new inventory session.");
          return;
        }

        setActiveSessionId((currentSessionId) => {
          if (
            currentSessionId &&
            data.some((session) => session.id === currentSessionId)
          ) {
            loadDashboardSummary(currentSessionId);
            return currentSessionId;
          }

          const newestSession = data[0];
          loadDashboardSummary(newestSession.id);
          setSessionMessage(`Active session: ${newestSession.name}`);
          return newestSession.id;
        });
      })
      .catch(() => {
        setSessions([]);
        setActiveSessionId(null);
        setDashboardSummary(null);
        setSessionMessage("Unable to load inventory sessions.");
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

    loadSessions();
  }, []);

  function handleCreateSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = newSessionName.trim();

    if (!trimmedName) {
      setSessionMessage("Enter a session name.");
      return;
    }

    setSessionMessage("Creating inventory session...");

    fetch("http://localhost:8080/api/inventory-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: trimmedName }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to create session.");
        }

        return response.json() as Promise<InventorySession>;
      })
      .then((createdSession) => {
        setNewSessionName("");
        setActiveSessionId(createdSession.id);
        setSessionMessage(`Active session: ${createdSession.name}`);
        setSelectedItem(null);
        setCountEntries([]);
        setCountSummary(null);
        setItems([]);
        setQuery("");
        setSearchMessage(
          "Search by serial number, barcode, item name, or category."
        );

        loadSessions();
        loadDashboardSummary(createdSession.id);
      })
      .catch(() => {
        setSessionMessage("Unable to create inventory session.");
      });
  }

  function handleSessionChange(sessionIdText: string) {
    if (!sessionIdText) {
      setActiveSessionId(null);
      setDashboardSummary(null);
      setSessionMessage("Select an inventory session.");
      return;
    }

    const sessionId = Number(sessionIdText);
    const selectedSession = sessions.find((session) => session.id === sessionId);

    setActiveSessionId(sessionId);
    setSelectedItem(null);
    setCountEntries([]);
    setCountSummary(null);
    setItems([]);
    setQuery("");
    setSearchMessage("Search by serial number, barcode, item name, or category.");
    setCountMessage("Select an item to begin recording counts.");
    setResetMessage("");

    if (selectedSession) {
      setSessionMessage(`Active session: ${selectedSession.name}`);
    }

    loadDashboardSummary(sessionId);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeSessionId) {
      setSearchMessage("Select or create an inventory session before searching.");
      return;
    }

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
    if (!activeSessionId) {
      setCountMessage("Select an inventory session before recording counts.");
      return;
    }

    setSelectedItem(item);
    setSelectedLocationId("");
    setQuantityFound("");
    setCountMessage(`Recording counts for ${item.name}.`);

    fetch(
      `http://localhost:8080/api/inventory-sessions/${activeSessionId}/items/${item.id}/count-entries`
    )
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

    fetch(
      `http://localhost:8080/api/inventory-sessions/${activeSessionId}/items/${item.id}/count-summary`
    )
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

    if (!activeSessionId) {
      setCountMessage("Select an inventory session before saving counts.");
      return;
    }

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
        sessionId: activeSessionId,
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
        const currentSessionId = activeSessionId;

        setQuantityFound("");
        setSelectedLocationId("");
        setCountMessage("Count saved successfully.");

        loadItemCountData(currentItem);
        loadDashboardSummary(currentSessionId);
      })
      .catch(() => {
        setCountMessage("Unable to save the count.");
      });
  }

  function handleResetCounts() {
    if (!activeSessionId) {
      setResetMessage("Select an inventory session first.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all saved count entries?"
    );

    if (!confirmed) {
      return;
    }

    setResetMessage("Clearing count entries...");

    fetch(
    `http://localhost:8080/api/inventory-sessions/${activeSessionId}/count-entries`,
    {
      method: "DELETE",
    }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to clear count entries.");
        }

        setItems([]);
        setSelectedItem(null);
        setCountEntries([]);
        setCountSummary(null);
        setQuery("");
        setSearchMessage(
          "Search by serial number, barcode, item name, or category."
        );
        setCountMessage("Select an item to begin recording counts.");
        setResetMessage("Count entries for this session were cleared successfully.");

        loadDashboardSummary(activeSessionId);
      })
      .catch(() => {
        setResetMessage("Unable to clear count entries.");
      });
  }

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

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

        <section className="session-section">
          <h2>Inventory Session</h2>

          <div className="session-controls">
            <label>
              Active session
              <select
                value={activeSessionId ?? ""}
                onChange={(event) => handleSessionChange(event.target.value)}
              >
                <option value="">Select a session</option>

                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} - {session.status}
                  </option>
                ))}
              </select>
            </label>

            <form className="session-form" onSubmit={handleCreateSession}>
              <input
                type="text"
                value={newSessionName}
                placeholder="Example: Annual Inventory Count 2026"
                onChange={(event) => setNewSessionName(event.target.value)}
              />

              <button type="submit">Create Session</button>
            </form>
          </div>

          <p className="session-message">{sessionMessage}</p>

          {activeSession && (
            <p className="active-session-label">
              Current session: <strong>{activeSession.name}</strong>
            </p>
          )}
        </section>

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

            <div className="dashboard-actions">
              <button
                type="button"
                className="reset-button"
                onClick={handleResetCounts}
              >
                Clear This Session's Counts
              </button>

              {resetMessage && <p>{resetMessage}</p>}
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
                  onChange={(event) => setQuantityFound(event.target.value)}
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