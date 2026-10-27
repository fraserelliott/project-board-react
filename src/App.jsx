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
import { useEffect } from "react";
import TagsPage from "./pages/TagsPage";
import CategoriesPage from "./pages/CategoriesPage";

export default function App() {
  useEffect(() => {
    const preventMouseNavigation = (e) => {
      if (e.button === 3 || e.button === 4) {
        e.preventDefault();
      }
    };

    window.addEventListener("mouseup", preventMouseNavigation);

    return () => {
      window.removeEventListener("mouseup", preventMouseNavigation);
    };
  }, []);

  // for prod, use the commented line instead
  return (
    <div className="app-layout">
      {/* <div className="app-layout" onContextMenu={(e) => e.preventDefault()}> */}
      <HashRouter>
        <div>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<ProjectsOverviewPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
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
