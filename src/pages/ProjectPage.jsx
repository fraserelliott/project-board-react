import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { ActionTable, useFEStyles } from "@fraserelliott/fe-components";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useEffect } from "react";

export default function ProjectPage() {
  const { id } = useParams();
  console.log(`Arrived at ProjectPage with id ${id}`);
  const { project, loadProject, loading, error, getTag } = useProject();
  const { styleComponent } = useFEStyles();

  useEffect(() => {
    if (!loading && !error && id && project?.id !== id) loadProject(id);
  }, [id, project?.id, loading, error, loadProject]);

  console.log("loading", loading);
  console.log("error", error);
  console.log("project", project);

  if (loading || error || project?.id !== id) return null;

  const renderTags = (task) => {
    return task.tags.map((tag) => getTag(tag)?.name).join(" | ");
  };

  const renderTasksSection = (category, extended) => {
    const filtered = project.tasks.filter(
      (task) => task.categoryId === category?.id,
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
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div {...styleComponent("Panel")}>
        {project?.tasks?.length > 0 ? (
          [...project.categories, null].map((category) =>
            renderTasksSection(category, true),
          )
        ) : (
          <h1>No tasks. Add your first task to get started.</h1>
        )}
      </div>
    </>
  );
}
