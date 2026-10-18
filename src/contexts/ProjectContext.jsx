import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from "react";
import { useToast } from "@fraserelliott/fe-components";
import {
  loadProject as loadProjectFile,
  saveProject,
} from "@/services/persistenceService";
import { error as logError } from "@tauri-apps/plugin-log";
import { v4 as uuidv4 } from "uuid";
import { isNameFieldValid } from "@/util/dataUtil";

const ProjectContext = createContext(undefined);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const saveQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToastMessage } = useToast();

  useEffect(() => {
    if (loading || error || project === null) return;

    saveQueue.current = saveQueue.current
      .then(() => saveProject(project))
      .catch((err) => {
        // keep the chain alive
        logError(err);
      });
  }, [project, loading, error]);

  const loadProject = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setProject(null);
    try {
      await saveQueue.current;
      const data = await loadProjectFile(id);
      setProject({
        id,
        name: data.name,
        tasks: data.tasks ?? [],
        tags: data.tags ?? [],
        categories: data.categories ?? [],
      });
    } catch (err) {
      await logError(err);
      setError(err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback((name) => {
    const task = {
      name,
      id: uuidv4(),
      categoryId: null,
      tagIds: [],
      status: "NotStarted",
      dependencyIds: [],
    };
    setProject((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    return task.id;
  }, []);

  const isTaskNameValid = useCallback(
    (name, excludeId) => isNameFieldValid(project.tasks, name, excludeId),
    [project?.tasks],
  );

  const getTag = useCallback(
    (tagId) => project?.tags?.find((tag) => tag.id === tagId),
    [project?.tags],
  );

  const deleteTag = useCallback((id) => {
    setProject((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.id !== id),
      tasks: prev.tasks.map((task) => ({
        ...task,
        tags: task.tagIds.filter((tagId) => tagId !== id),
      })),
    }));
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      project,
      loadProject,
      addTask,
      isTaskNameValid,
      getTag,
      deleteTag,
    }),
    [
      loading,
      error,
      project,
      loadProject,
      addTask,
      isTaskNameValid,
      getTag,
      deleteTag,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (ctx === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return ctx;
}
