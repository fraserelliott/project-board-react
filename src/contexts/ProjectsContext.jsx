import {
  createContext,
  useState,
  useEffect,
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
import { isNameFieldValid } from "@/util/dataUtil";
import { useProviderValueMemo } from "@/util/hookUtil";

const ProjectsContext = createContext(undefined);

export function ProjectsProvider({ children }) {
  const saveQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const { addToastMessage } = useToast();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await initialiseStorage();
        const all = await loadProjectsOverview();
        if (!cancelled) {
          setProjects(all.projects ?? []);
          setNotes(all.notes ?? []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          await logError(err);
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
      .then(() => saveProjectsOverview({ projects, notes }))
      .catch((err) => {
        // keep the chain alive
        logError(err);
      });
  }, [projects, notes, loading, error]);

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

  const updateProjectDate = useCallback((id) => {
    setProjects((prev) => [
      ...prev.map((project) =>
        project.id !== id ? project : { ...project, updatedAt: new Date() },
      ),
    ]);
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      await deleteProjectFile(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      await logError(err);
      addToastMessage("Error deleting project.", "error");
    }
  }, []);

  const isNameValid = useCallback(
    (name, excludeId) => isNameFieldValid(projects, name, excludeId),
    [projects],
  );

  const isNoteNameValid = useCallback(
    (name, excludeId) => isNameFieldValid(notes, name, excludeId),
    [notes],
  );

  const addNote = useCallback(
    (name) => {
      const nameValid = isNoteNameValid(name);
      if (!nameValid.valid) return null;
      const note = {
        name,
        id: uuidv4(),
        updatedAt: new Date(),
        content: "",
      };
      setNotes((prev) => [note, ...prev]);
      return note.id;
    },
    [isNoteNameValid],
  );

  const getNote = useCallback(
    (noteId) => notes?.find((note) => note.id === noteId),
    [notes],
  );

  const updateNote = useCallback(
    (noteId, content, name) => {
      const existing = getNote(noteId);
      if (!existing) throw Error("Note not found.");

      if (name !== undefined && name !== existing.name) {
        const nameValid = isNoteNameValid(name, noteId);
        if (!nameValid.valid) return false;
      }

      const note = {
        ...existing,
        content: content ?? existing.content,
        name: name ?? existing.name,
        updatedAt: new Date(),
      };

      setNotes((prev) => [note, ...prev.filter((n) => n.id !== noteId)]);
      return true;
    },
    [getNote, isNoteNameValid],
  );

  const deleteNote = useCallback((noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const value = useProviderValueMemo({
    loading,
    error,
    projects,
    notes,
    addProject,
    updateProject,
    updateProjectDate,
    deleteProject,
    isNameValid,
    isNoteNameValid,
    addNote,
    getNote,
    updateNote,
    deleteNote,
  });

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
