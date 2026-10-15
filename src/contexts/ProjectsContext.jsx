import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from "react";
import {
  saveProjectsOverview,
  loadProjectsOverview,
  initialiseStorage,
} from "@services/persistenceService";

const ProjectsContext = createContext(undefined);

export function ProjectsProvider({ children }) {
  const saveQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await initialiseStorage();
        const all = await loadProjectsOverview();
        if (!cancelled) {
          setProjects(Array.isArray(all) ? all : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load projects:", err);
          setProjects([]);
          setLoading(false);
          setError(err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || error) return;

    saveQueue.current = saveQueue.current
      .then(() => saveProjectsOverview(projects))
      .catch((err) => {
        // keep the chain alive
        console.error("Failed to save projects:", err);
      });
  }, [projects, loading]);

  const addProject = useCallback((project) => {
    setProjects((prev) => [{ ...project, updatedAt: new Date() }, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      projects,
      addProject,
    }),
    [loading, projects, addProject],
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (ctx === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return ctx;
}
