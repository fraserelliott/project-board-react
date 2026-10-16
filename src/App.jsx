import "./App.css";
import "@fraserelliott/fe-slate/fe-slate.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import ProjectsOverviewPage from "./pages/ProjectsOverviewPage";
import NotesPage from "./pages/NotesPage";
import {
  OptionalPortal,
  ToastMessageDisplay,
} from "@fraserelliott/fe-components";

export default function App() {
  return (
    <div className="app-layout">
      <HashRouter>
        <main>
          <Routes>
            <Route path="/" element={<ProjectsOverviewPage />} />
          </Routes>
        </main>

        <aside>
          <NotesPage />
        </aside>
      </HashRouter>
      <OptionalPortal>
        <ToastMessageDisplay />
      </OptionalPortal>
    </div>
  );
}
