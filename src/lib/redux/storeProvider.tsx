"use client";
import { Provider } from "react-redux";
import store, { persistor } from "./store"; // Import persistor
import type { ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
