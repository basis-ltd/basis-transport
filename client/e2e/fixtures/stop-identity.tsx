// Local visual fixture only; excluded from the application's production entry.
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../src/states/store";
import JourneyShell from "../../src/features/journey/JourneyShell";
import StopIdentity from "../../src/features/journey/StopIdentity";
import "../../src/index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <JourneyShell
        title="Central"
        description="Synthetic stop fixture — not real transport coverage."
        path="/e2e/fixtures/stop-identity.html"
      >
        <StopIdentity
          stop={{
            id: "SYNTHETIC_A",
            code: "SHARED",
            name: "Central",
            aliases: [],
            coordinates: [30, -1.95],
            platformCode: "2",
            displayNames: { fr: "Quai deux", rw: "Ahantu ha kabiri" },
            sourceRecord: {
              namespace: "synthetic-terminal",
              file: "stops.txt",
              recordId:
                "a-long-source-record-identity-preserved-without-merging-platforms",
            },
          }}
        />
      </JourneyShell>
    </BrowserRouter>
  </Provider>,
);
