import { useProject } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { useFEStyles } from "@fraserelliott/fe-components";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { sx } from "@fraserelliott/fe-utilities";

export default function NotesHeader({ openNote, onCloseNote }) {
  const { styleComponent } = useFEStyles();
  const { getNote: getGlobalNote } = useProjects();
  const { getNote: getProjectNote } = useProject();

  const navItemStyles = styleComponent("NavItem");

  return (
    <ul {...styleComponent("Navbar")}>
      <li
        onClick={() => onCloseNote?.(null)}
        style={sx(navItemStyles.style, !openNote && feSlateStyles.BtnPrimary, {
          cursor: "pointer",
        })}
      >
        Notes
      </li>
      {openNote && (
        <li style={sx(navItemStyles.style, feSlateStyles.BtnPrimary)}>
          {openNote.source === "global"
            ? getGlobalNote(openNote.id).name
            : getProjectNote(openNote.id).name}
        </li>
      )}
    </ul>
  );
}
