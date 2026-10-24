import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
} from "react";
import {
  loadProject as loadProjectFile,
  saveProject,
} from "@/services/persistenceService";
import { error as logError } from "@tauri-apps/plugin-log";
import { v4 as uuidv4 } from "uuid";
import { isNameFieldValid } from "@/util/dataUtil";
import { useProviderValueMemo } from "@/util/hookUtil";
import { useProjects } from "./ProjectsContext";

const ProjectContext = createContext(undefined);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(null);
  const saveQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { updateProjectDate } = useProjects();

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

  const isTaskNameValid = useCallback(
    (name, excludeId) => isNameFieldValid(project.tasks, name, excludeId),
    [project?.tasks],
  );

  const addTask = useCallback(
    (name) => {
      const nameValid = isTaskNameValid(name);
      if (!nameValid.valid) return null;
      const task = {
        name,
        id: uuidv4(),
        categoryId: null,
        tagIds: [],
        status: "NotStarted",
        dependencyIds: [],
      };
      setProject((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
      updateProjectDate(project.id);
      return task.id;
    },
    [updateProjectDate, isTaskNameValid, project?.id],
  );

  const updateTask = useCallback(
    (task) => {
      const nameValid = isTaskNameValid(task.name, task.id);
      if (!nameValid.valid) return false;
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
      }));
      updateProjectDate(project.id);
      return true;
    },
    [isTaskNameValid, updateProjectDate, project?.id],
  );

  const getTask = useCallback(
    (taskId) => project?.tasks?.find((task) => task.id === taskId),
    [project?.tasks],
  );

  const isTagNameValid = useCallback(
    (name, excludeId) => isNameFieldValid(project.tags, name, excludeId),
    [project?.tags],
  );

  const addTag = useCallback(
    (name, color = null) => {
      const nameValid = isTagNameValid(name);
      if (!nameValid.valid) return null;
      const tag = {
        name,
        id: uuidv4(),
        color,
      };
      setProject((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      updateProjectDate(project.id);
      return tag.id;
    },
    [isTagNameValid, updateProjectDate, project?.id],
  );

  const addTagToTask = useCallback(
    (taskId, tagId) => {
      const task = getTask(taskId);
      if (!task) return false;
      if (task.tagIds.some((t) => t === tagId)) return false;
      return updateTask({ ...task, tagIds: [...task.tagIds, tagId] });
    },
    [updateTask, getTask],
  );

  const removeTagFromTask = useCallback(
    (taskId, tagId) => {
      console.log(`removeTagFromTask(${taskId}, ${tagId})`);
      const task = getTask(taskId);
      if (!task) return false;
      return updateTask({
        ...task,
        tagIds: task.tagIds.filter((t) => t !== tagId),
      });
    },
    [updateTask, getTask],
  );

  const getTag = useCallback(
    (tagId) => project?.tags?.find((tag) => tag.id === tagId),
    [project?.tags],
  );

  const deleteTag = useCallback(
    (id) => {
      setProject((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag.id !== id),
        tasks: prev.tasks.map((task) => ({
          ...task,
          tagIds: task.tagIds.filter((tagId) => tagId !== id),
        })),
      }));
      updateProjectDate(project.id);
    },
    [updateProjectDate, project?.id],
  );

  const wouldCreateCycle = useCallback(
    (taskId, dependencyId) => {
      if (taskId === dependencyId) return true;

      const visited = new Set();

      const canReach = (currentId) => {
        if (currentId === taskId) return true;
        if (visited.has(currentId)) return false;

        visited.add(currentId);

        const task = getTask(currentId);
        if (!task) return false;

        return task.dependencyIds.some((id) => canReach(id));
      };

      return canReach(dependencyId);
    },
    [getTask],
  );

  const addDependency = useCallback(
    (taskId, dependencyId) => {
      if (wouldCreateCycle(taskId, dependencyId)) return false;
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id !== taskId
            ? task
            : { ...task, dependencyIds: [...task.dependencyIds, dependencyId] },
        ),
      }));
      updateProjectDate(project.id);
    },
    [updateProjectDate, project?.id, wouldCreateCycle],
  );

  const removeDependency = useCallback(
    (taskId, dependencyId) => {
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                dependencyIds: task.dependencyIds.filter(
                  (id) => id !== dependencyId,
                ),
              }
            : task,
        ),
      }));

      updateProjectDate(project.id);
    },
    [updateProjectDate, project?.id],
  );

  const getAvailableDependencies = useCallback(
    (taskId) => {
      return (
        project?.tasks.filter((task) => !wouldCreateCycle(taskId, task.id)) ??
        []
      );
    },
    [wouldCreateCycle, project?.tasks],
  );

  const blockedTasks = useMemo(() => {
    const tasks = project?.tasks ?? [];
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    return new Map(
      tasks.map((task) => [
        task.id,
        task.status !== "Completed" &&
          task.dependencyIds.some(
            (depId) => taskMap.get(depId)?.status !== "Completed",
          ),
      ]),
    );
  }, [project?.tasks]);

  const isBlocked = useCallback(
    (taskId) => blockedTasks.get(taskId) ?? false,
    [blockedTasks],
  );

  const staleTasks = useMemo(() => {
    const cache = new Map();
    const taskMap = new Map(
      (project?.tasks ?? []).map((task) => [task.id, task]),
    );

    const checkStale = (taskId) => {
      if (cache.has(taskId)) return cache.get(taskId);

      const task = taskMap.get(taskId);
      if (!task || isBlocked(taskId)) {
        cache.set(taskId, false);
        return false;
      }

      const stale = task.dependencyIds.some((depId) => {
        const dep = taskMap.get(depId);
        if (!dep) return false;

        return (
          checkStale(depId) ||
          (task.status === "Completed" && dep.status !== "Completed")
        );
      });

      cache.set(taskId, stale);
      return stale;
    };

    for (const task of taskMap.values()) {
      checkStale(task.id);
    }

    return cache;
  }, [project?.tasks, isBlocked]);

  const isStale = useCallback(
    (taskId) => staleTasks.get(taskId) ?? false,
    [staleTasks],
  );

  const isBlockedBy = useCallback(
    (taskId, otherId) => {
      const task = getTask(taskId);
      const other = getTask(otherId);
      if (!task || !other) throw Error("Task not found.");
      if (task.status === "Completed") return false;
      return other.status !== "Completed";
    },
    [getTask],
  );

  const hasStaleDependency = useCallback(
    (taskId, otherId) => {
      const task = getTask(taskId);
      const other = getTask(otherId);
      if (!task || !other) throw Error("Task not found.");
      return (
        isStale(otherId) ||
        (task.status === "Completed" && other.status !== "Completed")
      );
    },
    [isStale, getTask],
  );

  const getCategoryName = useCallback(
    (categoryId) => {
      if (!categoryId) return "Uncategorised";
      const category = project?.categories?.find(
        (category) => category.id === categoryId,
      );
      if (!category) throw Error("Category not found.");
      return category.name;
    },
    [project?.categories],
  );

  const isCategoryNameValid = useCallback(
    (name, excludeId) => isNameFieldValid(project.categories, name, excludeId),
    [project?.categories],
  );

  const addCategory = useCallback(
    (name) => {
      const nameValid = isCategoryNameValid(name);
      if (!nameValid.valid) return null;
      const category = {
        name: name.trim(),
        id: uuidv4(),
      };
      setProject((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }));
      updateProjectDate(project.id);
      return category.id;
    },
    [isCategoryNameValid, updateProjectDate, project?.id],
  );

  const value = useProviderValueMemo({
    loading,
    error,
    project,
    loadProject,
    addTask,
    isTaskNameValid,
    updateTask,
    getTask,
    addTag,
    addTagToTask,
    removeTagFromTask,
    isTagNameValid,
    getTag,
    deleteTag,
    addDependency,
    removeDependency,
    getAvailableDependencies,
    isBlocked,
    isStale,
    isBlockedBy,
    hasStaleDependency,
    getCategoryName,
    isCategoryNameValid,
    addCategory,
  });

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
