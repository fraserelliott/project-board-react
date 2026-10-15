import ReactDOM from "react-dom/client";
import App from "./App";
import { feSlateTheme } from "@fraserelliott/fe-slate";
import { FEStyleProvider } from "@fraserelliott/fe-components";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { error } from "@tauri-apps/plugin-log";
import { setupMenu } from "./util/setupMenu";

setupMenu().catch((err) => {
  error("Failed to initialise application menu:", err);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <FEStyleProvider theme={feSlateTheme}>
    <SettingsProvider>
      <ProjectsProvider>
        <App />
      </ProjectsProvider>
    </SettingsProvider>
  </FEStyleProvider>,
);
