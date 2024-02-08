import "./App.css";

import { useEffect, useState } from "react";

import reactLogo from "./assets/react.svg";
import { Todos } from "./Todos";

type AppStatus = "loading" | "idle" | ["error", string];

function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<AppStatus>("loading");

  // initial fetch when the component loads
  useEffect(() => {
    fetch("/api/counter")
      .then((res) => res.json())
      .then(({ counter }) => {
        setCount(counter);
        setStatus("idle");
      });
    // don't forget to add the empty array as the second argument
    // or this function will be executed on every render
  }, []);

  const handleClick = () => {
    setStatus("loading");
    // fire off the promise and update the state when it resolves
    fetch("/api/counter/increment")
      .then((res) => res.json())
      .then(({ counter }) => {
        setCount(counter);
        setStatus("idle");
      });
  };

  return (
    <div className="card">
      <div className="card-content">
        <section className="section">
          <a href="https://vitejs.dev" target="_blank">
            <img src="/vite.svg" className="logo" alt="Vite logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
          <h1>Vite + React</h1>
          <button
            className={`mt-2 button ${
              status === "loading" ? "is-loading" : ""
            }`}
            onClick={handleClick}
          >
            count is {count}
          </button>
        </section>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
        <Todos />
      </div>
    </div>
  );
}

export default App;
