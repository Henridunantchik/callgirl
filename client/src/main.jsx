import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from "react-helmet-async";

const root = createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    {/* Avoid blocking UI on rehydration; render app immediately */}
    <PersistGate loading={null} persistor={persistor}>
      <HelmetProvider>
        <ToastContainer />
        <App />
      </HelmetProvider>
    </PersistGate>
  </Provider>
);
