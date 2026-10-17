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
  createProject,
  deleteProject as deleteProjectFile,
} from "@services/persistenceService";
import { v4 as uuidv4 } from "uuid";
import { error as logError } from "@tauri-apps/plugin-log";
import { useToast } from "@fraserelliott/fe-components";

const ProjectsContext = createContext(undefined);

export function ProjectsProvider({ children }) {
  const saveQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const { addToastMessage } = useToast();

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
          logError(err);
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
        logError(err);
      });
  }, [projects, loading]);

  const addProject = useCallback(async (name) => {
    const project = {
      name,
      id: uuidv4(),
      updatedAt: new Date(),
      notes: "",
      status: "NotStarted",
    };
    try {
      await createProject(project.id, name);
      setProjects((prev) => [project, ...prev]);
    } catch (err) {
      logError(err);
      addToastMessage("Error creating project.", "error");
    }
  }, []);

  const updateProject = useCallback((project) => {
    setProjects((prev) => [
      { ...project, updatedAt: new Date() },
      ...prev.filter((p) => p.id !== project.id),
    ]);
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      await deleteProjectFile(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      logError(err);
      addToastMessage("Error deleting project.", "error");
    }
  }, []);

  const isNameValid = useCallback(
    (name, excludeId) => {
      const normalised = name.trim().toUpperCase();

      if (!normalised) {
        return {
          valid: false,
          reason: "Name must contain characters other than whitespace.",
        };
      }

      const isDuplicate = projects.some(
        (p) => p.id !== excludeId && p.name.toUpperCase() === normalised,
      );

      if (isDuplicate) {
        return { valid: false, reason: "Name already in use." };
      }

      return { valid: true };
    },
    [projects],
  );

  const value = useMemo(
    () => ({
      loading,
      projects,
      addProject,
      updateProject,
      deleteProject,
      isNameValid,
    }),
    [loading, projects, addProject, updateProject, deleteProject, isNameValid],
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
