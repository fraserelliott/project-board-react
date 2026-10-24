import { useState } from "react";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import NotesOverview from "@/components/notes/NotesOverview";
import { useFEStyles } from "@fraserelliott/fe-components";
import { useProject } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { NewNoteModal } from "@/components/notes/NewNoteModal";
import NoteView from "@/components/notes/NoteView";

export default function NotesPage() {
  const [openNote, setOpenNote] = useState(null);
  const [creatingNote, setCreatingNote] = useState(null);
  const { styleComponent } = useFEStyles();
  const {
    project,
    loading: projectLoading,
    error: projectError,
    addNote: addProjectNote,
    isNoteNameValid: isProjectNoteNameValid,
  } = useProject();
  const {
    loading: projectsLoading,
    error: projectsError,
    addNote: addGlobalNote,
    isNoteNameValid: isGlobalNoteNameValid,
  } = useProjects();

  if (projectLoading || projectsLoading || projectError || projectsError)
    return null;

  return (
    <div
      style={sx(
        utilities["fe-p-3"],
        utilities["fe-d-flex"],
        utilities["fe-flex-column"],
        utilities["fe-gap-3"],
        utilities["fe-h-100"],
      )}
    >
      <div style={sx(utilities["fe-d-flex"], utilities["fe-gap-2"])}>
        <button
          {...styleComponent("BtnPrimary")}
          onClick={() => setCreatingNote("global")}
        >
          New Global Note
        </button>
        {project && (
          <button
            {...styleComponent("BtnPrimary")}
            onClick={() => setCreatingNote("project")}
          >
            New Project Note
          </button>
        )}
      </div>
      {!openNote && <NotesOverview setOpenNote={setOpenNote} />}
      {openNote && <NoteView source={openNote.source} noteId={openNote.id} />}
      {creatingNote && (
        <NewNoteModal
          open={creatingNote !== null}
          onOpenChange={(newValue) =>
            newValue === false && setCreatingNote(null)
          }
          isNoteNameValid={
            creatingNote === "global"
              ? isGlobalNoteNameValid
              : isProjectNoteNameValid
          }
          createNote={
            creatingNote === "global" ? addGlobalNote : addProjectNote
          }
          heading={
            creatingNote === "global" ? "New Global Note" : "New Project Note"
          }
        />
      )}
    </div>
  );
}
