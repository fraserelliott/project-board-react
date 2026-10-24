import { useProject } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import { useFEStyles } from "@fraserelliott/fe-components";
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

export default function NoteView({ source, noteId }) {
  const { getNote: getGlobalNote } = useProjects();
  const { getNote: getProjectNote, project } = useProject();
  const { styleComponent } = useFEStyles();
  const [editing, setEditing] = useState(false);

  const note =
    source === "global" ? getGlobalNote(noteId) : getProjectNote(noteId);

  if (!note) return null;

  return (
    <div
      {...styleComponent(
        "Panel",
        sx(utilities["fe-gap-3"], utilities["fe-grow-1"]),
      )}
    >
      <h1 {...styleComponent("Heading")}>
        {source === "global"
          ? `Global > ${note.name}`
          : `${project.name} > ${note.name}`}
      </h1>
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
