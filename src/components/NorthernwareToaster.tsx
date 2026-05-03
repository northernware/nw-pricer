"use client";

import { Toaster } from "react-hot-toast";

export default function NorthernwareToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--nw-black)",
          color: "var(--nw-bone)",
          borderRadius: "0px",
          border: "1px solid rgba(92, 92, 92, 0.2)",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding: "12px 20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        },
        success: {
          iconTheme: {
            primary: "var(--nw-acid)",
            secondary: "var(--nw-black)",
          },
        },
        error: {
          iconTheme: {
            primary: "#ff4b4b",
            secondary: "var(--nw-black)",
          },
        },
      }}
    />
  );
}
