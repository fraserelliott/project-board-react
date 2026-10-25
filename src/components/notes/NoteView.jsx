import { useProject } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import {
  useFEStyles,
  ToggleButton,
  useToast,
} from "@fraserelliott/fe-components";
import { useState } from "react";
import MarkdownViewer from "../MarkdownViewer";
import { feSlateStyles } from "@fraserelliott/fe-slate";

const emptyNote = `
This note is empty. Click Edit to start writing.

Did you know you can use **Markdown** in these notes?
This panel is also rendered using Markdown.

Examples:
- **bold**
- *italic*
- \`inline code\`
`;

export default function NoteView({ source, noteId, onClose }) {
  const {
    getNote: getGlobalNote,
    updateNote: updateGlobalNote,
    isNoteNameValid: isGlobalNoteNameValid,
  } = useProjects();
  const {
    getNote: getProjectNote,
    updateNote: updateProjectNote,
    project,
    isNoteNameValid: isProjectNoteNameValid,
  } = useProject();
  const { styleComponent } = useFEStyles();
  const [editing, setEditing] = useState(false);
  const [nameValidation, setNameValidation] = useState(null);
  const { addToastMessage } = useToast();

  const note =
    source === "global" ? getGlobalNote(noteId) : getProjectNote(noteId);

  const [draftName, setDraftName] = useState(note?.name ?? "");

  const stopEditing = () => {
    setEditing(false);
  };

  const tryUpdateName = (e) => {
    const name = e.target.value.trim();
    if (name === note.name) return;

    const validation =
      source === "global"
        ? isGlobalNoteNameValid(name, noteId)
        : isProjectNoteNameValid(name, noteId);
    if (validation.valid) {
      source === "global"
        ? updateGlobalNote(noteId, null, name)
        : updateProjectNote(noteId, null, name);
      setNameValidation(null);
    } else {
      addToastMessage(validation.reason, "error");
      setNameValidation(validation);
    }
  };

  const handleContentBlur = (e) => {
    if (e.target.value !== (note.content ?? "")) {
      source === "global"
        ? updateGlobalNote(noteId, e.target.value)
        : updateProjectNote(noteId, e.target.value);
    }
  };

  if (!note) return null;

  return (
    <div
      {...styleComponent(
        "Panel",
        sx(utilities["fe-gap-3"], utilities["fe-grow-1"]),
      )}
    >
      <div
        style={sx(
          utilities["fe-d-flex"],
          utilities["fe-justify-between"],
          utilities["fe-items-center"],
          utilities["fe-gap-3"],
        )}
      >
        {editing && (
          <input
            {...styleComponent(
              "InputPrimary",
              sx(
                nameValidation?.valid === false && {
                  border: "1px solid #d9534f",
                },
                utilities["fe-grow-1"],
              ),
            )}
            value={draftName}
            onChange={(e) => {
              setNameValidation(null);
              setDraftName(e.target.value);
            }}
            onBlur={tryUpdateName}
            id="name"
          />
        )}
        {!editing && (
          <h1 {...styleComponent("Heading")}>
            {source === "global"
              ? `Global > ${note.name}`
              : `${project.name} > ${note.name}`}
          </h1>
        )}
        <div style={sx(utilities["fe-d-flex"], utilities["fe-gap-2"])}>
          <button onClick={() => onClose()} {...styleComponent("BtnPrimary")}>
            Close
          </button>
          <ToggleButton
            active={editing}
            onToggle={() => {
              if (editing) {
                stopEditing();
              } else {
                setDraftName(note.name);
                setNameValidation(null);
                setEditing(true);
              }
            }}
          >
            {editing ? "Stop Editing" : "Edit"}
          </ToggleButton>
        </div>
      </div>
      {editing && (
        <textarea
          defaultValue={note.content ?? ""}
          onBlur={handleContentBlur}
          {...styleComponent("InputPrimary", utilities["fe-grow-1"])}
        />
      )}
      {!editing && (
        <div
          style={sx(
            utilities["fe-grow-1"],
            utilities["fe-rounded-1"],
            utilities["fe-px-1"],
            utilities["fe-overflow-y-auto"],
            feSlateStyles.BGDropdown,
            feSlateStyles.GlassBorder,
            {
              minHeight: 0,
              flexBasis: 0,
            },
          )}
        >
          <MarkdownViewer>
            {note.content !== "" ? note.content : emptyNote}
          </MarkdownViewer>
        </div>
      )}
    </div>
  );
}
