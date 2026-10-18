import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { ActionTable, useFEStyles } from "@fraserelliott/fe-components";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useEffect, useState } from "react";
import { NewTaskModal } from "@/components/project/NewTaskModal";

export default function ProjectPage() {
  const { id } = useParams();
  const { project, loadProject, loading, error, getTag } = useProject();
  const { styleComponent } = useFEStyles();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  useEffect(() => {
    if (!loading && !error && id && project?.id !== id) loadProject(id);
  }, [id, project?.id, loading, error, loadProject]);

  if (loading || error || project?.id !== id) return null;

  const renderTags = (task) => {
    return task.tagIds.map((id) => getTag(id)?.name).join(" | ");
  };

  const renderTasksSection = (category, extended) => {
    const filtered = project.tasks.filter(
      (task) => task.categoryId === (category?.id ?? null),
    );
    const categoryName = category?.name ?? "No Category";

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
              { field: "tags", label: "Tags", renderItem: renderTags },
              { field: "status", label: "Status" },
            ]}
            getKey={(task) => task.id}
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
    </div>
  );
}
