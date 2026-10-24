import { useProject } from "@/contexts/ProjectContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { formatTime } from "@fraserelliott/date-formatter";
import { useFEStyles, ActionTable } from "@fraserelliott/fe-components";

export default function NotesOverview({ setOpenNote }) {
  const { notes } = useProjects();
  const { project } = useProject();
  const { styleComponent } = useFEStyles();

  const renderLastUpdated = (note) => {
    const updated = new Date(note.updatedAt);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now - updated) / 1000));

    if (diffSeconds < 10) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} minutes ago`;
    }

    const isToday = updated.toDateString() === now.toDateString();

    if (isToday) {
      return `Today, ${formatTime(updated, "hh:mm")}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (updated.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${formatTime(updated, "hh:mm")}`;
    }

    return formatTimestamp(updated);
  };

  const columns = [
    { field: "name", label: "Name" },
    {
      field: "updatedAt",
      label: "Last Updated",
      renderItem: renderLastUpdated,
    },
  ];

  return (
    <div {...styleComponent("Panel")}>
      <h1 {...styleComponent("Heading")}>Global Notes</h1>
      {notes.length > 0 ? (
        <ActionTable
          columns={columns}
          getKey={(note) => note.id}
          actions={[
            {
              key: 0,
              label: "Open",
              onAction: (note) =>
                setOpenNote({ source: "global", id: note.id }),
            },
          ]}
          separateActionColumns
          showHeadersWhenEmpty
          items={notes}
        />
      ) : (
        <span>No global notes. Add your first note to get started.</span>
      )}

      {project && (
        <>
          <h1 {...styleComponent("Heading")}>{project.name} Notes</h1>
          {project.notes.length > 0 ? (
            <ActionTable
              columns={columns}
              getKey={(note) => note.id}
              actions={[
                {
                  key: 0,
                  label: "Open",
                  onAction: (note) =>
                    setOpenNote({ source: "project", id: note.id }),
                },
              ]}
              separateActionColumns
              showHeadersWhenEmpty
              items={project.notes}
            />
          ) : (
            <span>No project notes. Add your first note to get started.</span>
          )}
        </>
      )}
    </div>
  );
}
