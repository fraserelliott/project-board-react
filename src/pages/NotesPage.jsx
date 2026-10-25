import { useState, useEffect } from "react";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import NotesOverview from "@/components/notes/NotesOverview";
import {
  ConfirmDialog,
  OptionalPortal,
  useFEStyles,
} from "@fraserelliott/fe-components";
import { useProject } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { NewNoteModal } from "@/components/notes/NewNoteModal";
import NoteView from "@/components/notes/NoteView";
import NotesHeader from "@/components/notes/NotesHeader";

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
    deleteNote: deleteProjectNote,
  } = useProject();
  const {
    loading: projectsLoading,
    error: projectsError,
    addNote: addGlobalNote,
    isNoteNameValid: isGlobalNoteNameValid,
    deleteNote: deleteGlobalNote,
  } = useProjects();
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    setOpenNote((prev) => (prev?.source === "project" ? null : prev));
  }, [project?.id]);

  const handleDelete = () => {
    pendingDelete.source === "global"
      ? deleteGlobalNote(pendingDelete.id)
      : deleteProjectNote(pendingDelete.id);
    setPendingDelete(null);
  };

  if (projectLoading || projectsLoading || projectError || projectsError)
    return null;

  return (
    <div
      style={sx(
        utilities["fe-d-flex"],
        utilities["fe-flex-column"],
        utilities["fe-h-100"],
        { minHeight: 0 },
      )}
    >
      <NotesHeader openNote={openNote} onCloseNote={setOpenNote} />
      <div
        style={sx(
          utilities["fe-p-3"],
          utilities["fe-d-flex"],
          utilities["fe-flex-column"],
          utilities["fe-gap-3"],
          utilities["fe-h-100"],
          utilities["fe-overflow-auto"],
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
        {!openNote && (
          <NotesOverview
            setOpenNote={setOpenNote}
            deleteNote={setPendingDelete}
          />
        )}
        {openNote && (
          <NoteView
            source={openNote.source}
            noteId={openNote.id}
            onClose={() => setOpenNote(null)}
          />
        )}
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
        {pendingDelete && (
          <OptionalPortal>
            <ConfirmDialog
              open={pendingDelete !== null}
              onConfirm={() => handleDelete()}
              heading={pendingDelete.name}
              onOpenChange={(newValue) =>
                newValue === false && setPendingDelete(null)
              }
              text="Are you sure you want to delete this note? This cannot be undone."
              confirmLabel="Delete"
              style={{
                Panel: {
                  width: "15rem",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid rgba(59, 130, 246, 0.8)",
                },
              }}
              overlay={true}
              cancelBtnSlot="BtnPrimary"
              confirmBtnSlot="BtnDanger"
              draggable
              closeOnEscape
            />
          </OptionalPortal>
        )}
      </div>
    </div>
  );
}
