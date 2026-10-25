import "./App.css";
import "@fraserelliott/fe-slate/fe-slate.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import ProjectsOverviewPage from "./pages/ProjectsOverviewPage";
import NotesPage from "./pages/NotesPage";
import ProjectPage from "./pages/ProjectPage";
import {
  OptionalPortal,
  ToastMessageDisplay,
} from "@fraserelliott/fe-components";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="app-layout">
      <HashRouter>
        <div>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<ProjectsOverviewPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
            </Routes>
          </main>
        </div>

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
