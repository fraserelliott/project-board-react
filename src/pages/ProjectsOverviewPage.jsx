import {
  ActionTable,
  useFEStyles,
  ToggleButton,
  useToast,
  OptionalPortal,
  ConfirmDialog,
} from "@fraserelliott/fe-components";
import { useProjects } from "@/contexts/ProjectsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { formatTime } from "@fraserelliott/date-formatter";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import { NewProjectModal } from "@/components/projects-overview/NewProjectModal";
import { useNavigate } from "react-router-dom";

export default function ProjectsOverviewPage() {
  const { styleComponent } = useFEStyles();
  const { projects, updateProject, deleteProject, isNameValid } = useProjects();
  const { formatTimestamp } = useSettings();
  const [editingId, setEditingId] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const {
    register,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    reset,
  } = useForm();
  const [visibleStatuses, setVisibleStatuses] = useState([
    "NotStarted",
    "InProgress",
    "Completed",
  ]);
  const [isValidName, setIsValidName] = useState(null);
  const { addToastMessage } = useToast();
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigate = useNavigate();

  const toggleStatus = (status) => {
    setVisibleStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const isStatusVisible = (status) => visibleStatuses.includes(status);

  const filteredProjects = projects.filter((project) =>
    visibleStatuses.includes(project.status),
  );

  const renderFilterButton = (status) => (
    <ToggleButton
      active={!isStatusVisible(status)}
      onToggle={() => toggleStatus(status)}
    >
      {isStatusVisible(status) ? `Hide ${status}` : `Show ${status}`}
    </ToggleButton>
  );

  const openProject = (project) => {
    navigate(`project/${project.id}`);
  };

  const startEditing = (project) => {
    reset(project);
    setEditingId(project.id);
    setIsValidName(null);
  };

  const saveEdit = (data) => {
    const name = data.name.trim();
    const validName = isNameValid(name);
    if (!validName.valid) {
      addToastMessage(validName.reason, "error");
      return setIsValidName(validName);
    }
    updateProject({ id: editingId, ...data });
    setEditingId(false);
  };

  const validateUpdatedName = (name) => {
    const isValid = isNameValid(name, editingId);
    setIsValidName(isValid);
    if (!isValid.valid) addToastMessage(isValid.reason, "error");
  };

  const renderName = (project) => {
    if (editingId !== project.id) {
      return project.name;
    } else {
      return (
        <input
          {...styleComponent(
            "InputPrimary",
            sx(
              { width: "95%" },
              isValidName?.valid === false && {
                border: "1px solid var(--fes-btn-danger, #f87171)",
              },
            ),
          )}
          {...register("name", {
            onChange: () => setIsValidName(null),
            onBlur: (event) => validateUpdatedName(event.target.value),
          })}
        />
      );
    }
  };

  const renderNotes = (project) => {
    if (editingId !== project.id) {
      return project.notes;
    } else {
      return (
        <input
          {...styleComponent("InputPrimary", { width: "95%" })}
          {...register("notes")}
        />
      );
    }
  };

  const renderStatus = (project) => {
    if (editingId !== project.id) {
      return project.status;
    } else {
      return (
        <select {...styleComponent("InputPrimary")} {...register("status")}>
          <option>NotStarted</option>
          <option>InProgress</option>
          <option>Completed</option>
        </select>
      );
    }
  };

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

  const renderEditActions = (project) => {
    if (project.id !== editingId) {
      return (
        <div style={{ width: "9em" }}>
          <button
            {...styleComponent("BtnPrimary")}
            onClick={() => startEditing(project)}
          >
            Edit
          </button>
        </div>
      );
    } else {
      return (
        <div
          style={sx(utilities["fe-d-flex"], utilities["fe-gap-2"], {
            width: "9em",
          })}
        >
          <input
            {...styleComponent("BtnPrimary")}
            type="submit"
            value="Save"
            disabled={!isDirty || isSubmitting}
          />
          <button
            {...styleComponent("BtnPrimary")}
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        </div>
      );
    }
  };

  const actions = [
    {
      key: 0,
      label: "Open",
      onAction: openProject,
    },
    {
      key: 1,
      label: "Delete",
      onAction: setPendingDelete,
      buttonStyleSlot: "BtnDanger",
    },
  ];

  const columns = [
    { field: "name", label: "Name", renderItem: renderName },
    { field: "notes", label: "Notes", renderItem: renderNotes },
    { field: "status", label: "Status", renderItem: renderStatus },
    {
      field: "updatedAt",
      label: "Last Updated",
      renderItem: renderLastUpdated,
    },
    { field: "edit", label: "Edit", renderItem: renderEditActions },
  ];

  return (
    <>
      {showNewProjectModal && (
        <NewProjectModal
          open={showNewProjectModal}
          onOpenChange={setShowNewProjectModal}
        />
      )}
      {pendingDelete && (
        <OptionalPortal>
          <ConfirmDialog
            open={pendingDelete}
            onConfirm={() => deleteProject(pendingDelete.id)}
            onOpenChange={() => setPendingDelete(null)}
            heading={pendingDelete.name}
            text="Are you sure you want to delete this project? This cannot be undone."
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
          />
        </OptionalPortal>
      )}
      <div
        style={sx(
          utilities["fe-p-3"],
          utilities["fe-d-flex"],
          utilities["fe-flex-column"],
          utilities["fe-gap-3"],
        )}
      >
        <div
          style={sx(utilities["fe-d-flex"], utilities["fe-justify-between"])}
        >
          <button
            {...styleComponent("BtnPrimary")}
            onClick={() => setShowNewProjectModal(true)}
          >
            New Project
          </button>

          <div
            style={sx(
              utilities["fe-d-flex"],
              utilities["fe-gap-2"],
              utilities["fe-items-center"],
            )}
          >
            {renderFilterButton("NotStarted")}
            {renderFilterButton("InProgress")}
            {renderFilterButton("Completed")}
          </div>
        </div>
        <div {...styleComponent("Panel")}>
          <form onSubmit={handleSubmit(saveEdit)}>
            <ActionTable
              columns={columns}
              getKey={(project) => project.id}
              actions={actions}
              separateActionColumns
              showHeadersWhenEmpty
              items={filteredProjects}
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
            />
          </form>
        </div>
      </div>
    </>
  );
}
