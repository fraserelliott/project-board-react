import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { ActionTable, useFEStyles } from "@fraserelliott/fe-components";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useEffect, useState } from "react";
import { NewTaskModal } from "@/components/project/NewTaskModal";
import { ViewTaskModal } from "@/components/project/ViewTaskModal";
import TagDisplay from "@/components/project/TagDisplay";
import { AlertTriangle, LockKeyhole } from "lucide-react";

export default function ProjectPage() {
  const { id } = useParams();
  const {
    project,
    loadProject,
    loading,
    error,
    getTask,
    updateTask,
    isBlocked,
    isStale,
  } = useProject();
  const { styleComponent } = useFEStyles();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [openedTaskId, setOpenedTaskId] = useState(null);

  useEffect(() => {
    if (!loading && !error && id && project?.id !== id) loadProject(id);
  }, [id, project?.id, loading, error, loadProject]);

  if (loading || error || project?.id !== id) return null;

  const renderStatusChangeColumn = (task) =>
    task.status === "NotStarted"
      ? renderStatusChangeBtn(task, "InProgress", "Start")
      : task.status === "InProgress"
        ? renderStatusChangeBtn(task, "Completed", "Complete")
        : renderStatusChangeBtn(task, "InProgress", "Reopen");

  const renderStatusChangeBtn = (task, newStatus, label) => (
    <button
      role="button"
      {...styleComponent("BtnPrimary")}
      onClick={() => updateTask({ ...task, status: newStatus })}
    >
      {label}
    </button>
  );

  const renderTasksSection = (category, extended) => {
    const filtered = project.tasks.filter(
      (task) => task.categoryId === (category?.id ?? null),
    );
    const categoryName = category?.name ?? "No Category";

    const renderTaskAlert = (task) => {
      if (isBlocked(task.id))
        return (
          <span color="#f87171">
            <LockKeyhole size={16} /> Blocked
          </span>
        );

      if (isStale(task.id))
        return (
          <span color="#F59E0B">
            <AlertTriangle size={16} /> Stale
          </span>
        );
    };

    return (
      <div
        key={category?.id ?? 0}
        style={sx(
          utilities["fe-d-flex"],
          utilities["fe-flex-column"],
          utilities["fe-gap-1"],
        )}
      >
        <h2>{`${categoryName} (${filtered.length})`}</h2>
        {extended && (
          <ActionTable
            items={filtered}
            columns={[
              { field: "name", label: "Name" },
              {
                field: "tags",
                label: "Tags",
                renderItem: (task) => <TagDisplay tagIds={task.tagIds} />,
              },
              { field: "status", label: "Status" },
              { field: "alert", label: "Alert", renderItem: renderTaskAlert },
              {
                field: "action",
                label: "Action",
                renderItem: renderStatusChangeColumn,
              },
            ]}
            actions={[
              {
                key: 1,
                label: "Open",
                onAction: (task) => setOpenedTaskId(task.id),
              },
            ]}
            styleRow={(item) =>
              item.status === "Completed"
                ? {
                    backgroundColor: "rgba(54, 90, 73, 0.6)",
                  }
                : item.status === "InProgress"
                  ? {
                      backgroundColor: "#263C56",
                    }
                  : {}
            }
            getKey={(task) => task.id}
            separateActionColumns
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={sx(
        utilities["fe-p-3"],
        utilities["fe-d-flex"],
        utilities["fe-flex-column"],
        utilities["fe-gap-3"],
      )}
    >
      <div>
        <button
          {...styleComponent("BtnPrimary")}
          onClick={() => setShowNewTaskModal(true)}
        >
          Add Task
        </button>
      </div>
      <div {...styleComponent("Panel")}>
        {project?.tasks?.length > 0 ? (
          [...project.categories, null].map((category) =>
            renderTasksSection(category, true),
          )
        ) : (
          <h1>No tasks. Add your first task to get started.</h1>
        )}
      </div>
      {showNewTaskModal && (
        <NewTaskModal
          open={showNewTaskModal}
          onOpenChange={setShowNewTaskModal}
        />
      )}
      {openedTaskId && (
        <ViewTaskModal
          task={getTask(openedTaskId)}
          onOpenChange={setOpenedTaskId}
        />
      )}
    </div>
  );
}
