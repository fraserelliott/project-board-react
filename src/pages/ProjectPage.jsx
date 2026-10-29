import { useParams } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import {
  ActionTable,
  useFEStyles,
  OptionalPortal,
  ConfirmDialog,
} from "@fraserelliott/fe-components";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useEffect, useState, useRef } from "react";
import { NewTaskModal } from "@/components/project/NewTaskModal";
import { ViewTaskModal } from "@/components/project/ViewTaskModal";
import TagDisplay from "@/components/project/TagDisplay";
import {
  AlertTriangle,
  LockKeyhole,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ItemSelector from "@/components/ItemSelector";
import ImportTasksModal from "@/components/project/ImportTasksModal";

const allStatuses = [
  {
    id: 1,
    name: "NotStarted",
  },
  {
    id: 2,
    name: "InProgress",
  },
  {
    id: 3,
    name: "Completed",
  },
];

function getStatusId(status) {
  return allStatuses.find((s) => s.name === status).id;
}

const uncategorisedObj = { id: null, name: "No Category" };

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
    removeTagFromTask,
    tagsInUse,
    countCategoryUsage,
    categoriesInUse,
    deleteTask,
  } = useProject();
  const { styleComponent } = useFEStyles();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [openedTaskId, setOpenedTaskId] = useState(null);
  const [visibleStatuses, setVisibleStatuses] = useState(
    allStatuses.map((s) => s.id),
  );
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(
    categoriesInUse.map((c) => c.id),
  );
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!loading && !error && id && project?.id !== id) loadProject(id);
  }, [id, project?.id, loading, error, loadProject]);

  useEffect(() => {
    const availableIds = tagsInUse.map((tag) => tag.id);

    setSelectedTagIds((prev) => prev.filter((id) => availableIds.includes(id)));
  }, [tagsInUse]);

  const previousCategoriesInUse = useRef([]);

  useEffect(() => {
    const previous = previousCategoriesInUse.current;

    const changed =
      previous.length !== categoriesInUse.length ||
      previous.some((id) => !categoriesInUse.includes(id));

    if (changed) {
      setExpandedCategories(categoriesInUse.map((c) => c.id));
    }

    previousCategoriesInUse.current = categoriesInUse;
  }, [categoriesInUse]);

  if (loading || error || project?.id !== id) return null;

  const handleDelete = () => {
    deleteTask(pendingDelete.id);
    setPendingDelete(null);
  };

  const handleVisibleTagChange = (tag, newValue) => {
    const tagId = tag.id;
    if (newValue) setSelectedTagIds((prev) => [...prev, tagId]);
    else setSelectedTagIds((prev) => prev.filter((t) => t !== tagId));
  };

  const handleVisibleStatusChange = (status, newValue) => {
    const statusId = status.id;
    if (newValue) setVisibleStatuses((prev) => [...prev, statusId]);
    else setVisibleStatuses((prev) => prev.filter((s) => s !== statusId));
  };

  const handleExpandedChange = (category, newValue) => {
    const categoryId = category.id;
    if (!countCategoryUsage(categoryId)) return;
    if (newValue) setExpandedCategories((prev) => [...prev, categoryId]);
    else setExpandedCategories((prev) => prev.filter((c) => c !== categoryId));
  };

  const handleShowAll = () => {
    setExpandedCategories(categoriesInUse.map((category) => category.id));
    setVisibleStatuses(allStatuses.map((status) => status.id));
    setSelectedTagIds([]);
  };

  const filteredTasks = project.tasks
    .filter((task) => visibleStatuses.includes(getStatusId(task.status)))
    .filter(
      (task) =>
        selectedTagIds.length === 0 ||
        task.tagIds.some((id) => selectedTagIds.includes(id)),
    );

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

  const renderTasksSection = (category) => {
    const expanded = expandedCategories.includes(category.id);

    const filtered = filteredTasks.filter(
      (task) => task.categoryId === (category?.id ?? null),
    );

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
          { paddingBottom: "0.5em", borderBottom: "1px solid #475569" },
        )}
      >
        <h2
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => handleExpandedChange(category, !expanded)}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {`${category.name} (${countCategoryUsage(category.id)})`}
        </h2>
        {expanded && (
          <ActionTable
            items={filtered}
            columns={[
              { field: "name", label: "Name" },
              {
                field: "tags",
                label: "Tags",
                renderItem: (task) => (
                  <TagDisplay
                    tagIds={task.tagIds}
                    onRemove={(tagId) => removeTagFromTask(task.id, tagId)}
                  />
                ),
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
              {
                key: 2,
                label: "Delete",
                buttonStyleSlot: "BtnDanger",
                onAction: setPendingDelete,
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
      <div style={sx(utilities["fe-d-flex"], utilities["fe-justify-between"])}>
        <div style={sx(utilities["fe-d-flex"], utilities["fe-gap-2"])}>
          <button
            {...styleComponent("BtnPrimary")}
            onClick={() => setShowNewTaskModal(true)}
          >
            Add Task
          </button>
          <button
            {...styleComponent("BtnPrimary")}
            onClick={() => setShowImportModal(true)}
          >
            Import Tasks
          </button>
        </div>

        <div
          style={sx(
            utilities["fe-d-flex"],
            utilities["fe-gap-2"],
            utilities["fe-items-center"],
          )}
        >
          <ItemSelector
            allItems={[...project.categories, uncategorisedObj]}
            buttonText="Expand Categories"
            selectedIds={expandedCategories}
            onChange={handleExpandedChange}
            disableRow={(item) => countCategoryUsage(item.id) === 0}
          />
          <ItemSelector
            allItems={allStatuses}
            buttonText="Filter Statuses"
            selectedIds={visibleStatuses}
            onChange={handleVisibleStatusChange}
          />
          <ItemSelector
            allItems={tagsInUse}
            buttonText="Filter Tags"
            selectedIds={selectedTagIds}
            onChange={handleVisibleTagChange}
          />
          <button onClick={handleShowAll} {...styleComponent("BtnPrimary")}>
            Show All
          </button>
        </div>
      </div>
      <div {...styleComponent("Panel")}>
        {project?.tasks?.length > 0 ? (
          [...project.categories, uncategorisedObj].map((category) =>
            renderTasksSection(category),
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
      {showImportModal && (
        <ImportTasksModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
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
            text="Are you sure you want to delete this task? This cannot be undone."
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
  );
}
