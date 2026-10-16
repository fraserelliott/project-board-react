import ReactDOM from "react-dom/client";
import App from "./App";
import { feSlateTheme } from "@fraserelliott/fe-slate";
import {
  FEStyleProvider,
  FocusManagerProvider,
  ToastProvider,
} from "@fraserelliott/fe-components";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { error } from "@tauri-apps/plugin-log";
import { setupMenu } from "./util/setupMenu";
import { sx } from "@fraserelliott/fe-utilities";

setupMenu().catch((err) => {
  error("Failed to initialise application menu:", err);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <FEStyleProvider
    theme={sx(feSlateTheme, {
      inline: { Panel: { border: "1px solid rgba(100, 116, 139, 0.6)" } },
    })}
  >
    <ToastProvider>
      <SettingsProvider>
        <ProjectsProvider>
          <FocusManagerProvider>
            <App />
          </FocusManagerProvider>
        </ProjectsProvider>
      </SettingsProvider>
    </ToastProvider>
  </FEStyleProvider>,
);
