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
import { sx } from "@fraserelliott/fe-utilities";
import { ProjectProvider } from "./contexts/ProjectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <FEStyleProvider
    theme={sx(feSlateTheme, {
      inline: { Panel: { border: "1px solid rgba(100, 116, 139, 0.6)" } },
    })}
  >
    <ToastProvider>
      <SettingsProvider>
        <ProjectsProvider>
          <ProjectProvider>
            <FocusManagerProvider>
              <App />
            </FocusManagerProvider>
          </ProjectProvider>
        </ProjectsProvider>
      </SettingsProvider>
    </ToastProvider>
  </FEStyleProvider>,
);
