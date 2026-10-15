import { ActionTable, useFEStyles } from "@fraserelliott/fe-components";
import { useProjects } from "@/contexts/ProjectsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { formatTime } from "@fraserelliott/date-formatter";

export default function ProjectsOverviewPage() {
  const { styleComponent } = useFEStyles();
  const { projects } = useProjects();
  const { formatTimestamp } = useSettings();

  const openProject = () => {
    // TODO: implement openProject
  };

  const editProject = () => {
    // TODO: implement editProject
  };

  const deleteProject = () => {
    // TODO: implement deleteProject
  };

  const actions = [
    {
      key: 0,
      label: "Open",
      onAction: openProject,
    },
    {
      key: 1,
      label: "Edit",
      onAction: editProject,
    },
    {
      key: 2,
      label: "Delete",
      onAction: deleteProject,
      buttonStyleSlot: "BtnDanger",
    },
  ];

  const renderLastUpdated = (project) => {
    const updated = new Date(project.updatedAt);
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
    { field: "notes", label: "Notes" },
    { field: "status", label: "Status" },
    {
      field: "updatedAt",
      label: "Last Updated",
      renderItem: renderLastUpdated,
    },
  ];

  return (
    <div {...styleComponent("Panel")}>
      <ActionTable
        columns={columns}
        getKey={(project) => project.id}
        actions={actions}
        separateActionColumns
        showHeadersWhenEmpty
        items={projects}
      />
    </div>
  );
}
