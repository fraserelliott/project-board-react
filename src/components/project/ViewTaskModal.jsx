import {
  OptionalPortal,
  Modal,
  useFEStyles,
  ToggleButton,
  ConfirmDialog,
} from "@fraserelliott/fe-components";
import { useState, useMemo } from "react";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { useProject } from "@/contexts/ProjectContext";
import MarkdownViewer from "../MarkdownViewer";
import TagDisplay from "./TagDisplay";
import ItemSelector from "../ItemSelector";
import TagModal from "./TagModal";
import DependencyDisplay from "./DependencyDisplay";
import { CategoryModal } from "./CategoryModal";

const formRow = sx(
  utilities["fe-d-flex"],
  utilities["fe-gap-2"],
  utilities["fe-w-100"],
  utilities["fe-items-start"],
);
const formGroupVertical = sx(
  utilities["fe-d-flex"],
  utilities["fe-flex-column"],
  utilities["fe-gap-1"],
);
const formGroupVerticalGrow = sx(formGroupVertical, utilities["fe-grow-1"], {
  minHeight: 0,
});
const labelStyle = sx(feSlateStyles.TextMuted, { fontSize: "0.8em" });

export function ViewTaskModal({ task, onOpenChange }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(task.name);
  const [nameValidation, setNameValidation] = useState();
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { styleComponent } = useFEStyles();
  const {
    project,
    isTaskNameValid,
    updateTask,
    addTagToTask,
    addTag,
    removeTagFromTask,
    getAvailableDependencies,
    addDependency,
    removeDependency,
    getCategoryName,
    addCategory,
  } = useProject();
  const [draftTagName, setDraftTagName] = useState(null);

  const isNameFieldDirty = draftName?.trim() !== task.name;

  const availableDependencies = useMemo(
    () => getAvailableDependencies(task.id),
    [getAvailableDependencies, task.id],
  );

  const tryUpdateName = (event) => {
    const name = event.target.value.trim();
    if (name === task.name) return;

    const validation = isTaskNameValid(name, task.id);
    if (validation.valid) {
      updateTask({ ...task, name });
      setNameValidation(null);
    } else {
      setNameValidation(validation);
    }
  };

  const cancelEdit = () => {
    setDraftName(task.name);
    setEditing(false);
    setNameValidation(null);
  };

  const stopEditing = () => {
    const name = draftName.trim();

    if (!isNameFieldDirty) {
      return cancelEdit();
    }

    const validation = isTaskNameValid(name, task.id);

    if (validation.valid) {
      setEditing(false);
    } else {
      setNameValidation(validation);
      setShowDiscardConfirmation(true);
    }
  };

  const handleCreateTag = (tag) => {
    const tagId = addTag(tag.name, tag.color);
    if (!tagId) return addToastMessage("Error adding tag.", "error");
    addTagToTask(task.id, tagId);
    setDraftTagName(null);
  };

  const handleCreateCategory = (name) => {
    const id = addCategory(name);
    setCategory(id);
    setShowCategoryModal(false);
  };

  const handleTagChange = (tag, newValue) => {
    if (newValue) addTagToTask(task.id, tag.id);
    else removeTagFromTask(task.id, tag.id);
  };

  const handleDependencyChange = (dependency, newValue) => {
    const dependencyId = dependency.id;
    if (newValue) addDependency(task.id, dependencyId);
    else removeDependency(task.id, dependencyId);
  };

  const setCategory = (categoryId) => {
    updateTask({
      ...task,
      categoryId: categoryId || null,
    });
  };

  if (!task) return null;

  return (
    <OptionalPortal portalTarget={document.body}>
      <Modal
        open={task}
        onOpenChange={onOpenChange}
        heading={task.name}
        showCloseButtons="corner"
        overlay={false}
        closeOnEscape
        draggable
        style={{
          Panel: {
            width: "clamp(500px, 75vw, 800px)",
            height: "clamp(400px, 75vw, 600px)",
            border: "1px solid rgba(59, 130, 246, 0.8)",
          },
        }}
      >
        <div
          style={sx(
            utilities["fe-d-flex"],
            utilities["fe-flex-column"],
            utilities["fe-gap-2"],
            utilities["fe-grow-1"],
          )}
        >
          <div style={formRow}>
            <div style={formGroupVertical}>
              <label style={labelStyle} htmlFor="category">
                Category
              </label>
              {editing ? (
                <select
                  id="category"
                  value={task.categoryId ?? ""}
                  onChange={(e) => {
                    if (e.target.value === "__create__") {
                      setShowCategoryModal(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  {...styleComponent("InputPrimary")}
                >
                  <option value="">Uncategorised</option>

                  {project.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}

                  <option value="__create__">+ Create New Category</option>
                </select>
              ) : (
                <span>{getCategoryName(task.categoryId)}</span>
              )}
            </div>

            <div style={formGroupVerticalGrow}>
              <label style={labelStyle} htmlFor="name">
                Name
              </label>
              {!editing && <span>{task.name}</span>}
              {editing && (
                <input
                  {...styleComponent(
                    "InputPrimary",
                    sx(
                      nameValidation?.valid === false && {
                        border: "1px solid #d9534f",
                      },
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
              <div style={{ height: "1.5em" }}>
                {nameValidation?.valid === false && (
                  <p style={{ color: "#d9534f" }}>{nameValidation.reason}</p>
                )}
              </div>
            </div>

            <div style={sx(formGroupVertical, { width: "8em" })}>
              <ToggleButton
                active={editing}
                onToggle={() => {
                  if (editing) stopEditing();
                  else setEditing(true);
                }}
              >
                {editing ? "Stop Editing" : "Edit"}
              </ToggleButton>
              {isNameFieldDirty && (
                <button onClick={cancelEdit} {...styleComponent("BtnPrimary")}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={formRow}>
            <div style={formGroupVerticalGrow}>
              <label style={labelStyle}>Tags</label>
              <TagDisplay
                tagIds={task.tagIds}
                showRemoveBtn={editing}
                onRemove={(tagId) => removeTagFromTask(task.id, tagId)}
              />
            </div>
            {editing && (
              <>
                <ItemSelector
                  allItems={project.tags}
                  buttonText="Select Tags"
                  showUnusedItems
                  selectedIds={task.tagIds}
                  onCreate={setDraftTagName}
                  onChange={handleTagChange}
                />
              </>
            )}
          </div>

          <div style={formGroupVerticalGrow}>
            <label style={labelStyle} htmlFor="notes">
              Notes
            </label>
            {editing ? (
              <textarea
                id="notes"
                defaultValue={task.notes ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (task.notes ?? "")) {
                    updateTask({ ...task, notes: e.target.value });
                  }
                }}
                {...styleComponent("InputPrimary", utilities["fe-grow-1"])}
              />
            ) : (
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
                <MarkdownViewer>{task.notes ?? ""}</MarkdownViewer>
              </div>
            )}
          </div>

          <div style={formRow}>
            <div style={formGroupVerticalGrow}>
              <label style={labelStyle}>Dependencies</label>
              <DependencyDisplay
                dependencyIds={task.dependencyIds}
                showRemoveBtn={editing}
                onRemove={(dependencyId) =>
                  removeDependency(task.id, dependencyId)
                }
                taskId={task.id}
              />
            </div>
            {editing && (
              <>
                {availableDependencies.length > 0 ? (
                  <ItemSelector
                    allItems={availableDependencies}
                    buttonText="Select Dependencies"
                    selectedIds={task.dependencyIds}
                    onChange={handleDependencyChange}
                    renderAbove
                  />
                ) : (
                  <span style={{ opacity: 0.8 }}>
                    No Available Dependencies
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
      {showDiscardConfirmation && (
        <ConfirmDialog
          open={showDiscardConfirmation}
          onConfirm={cancelEdit}
          onOpenChange={setShowDiscardConfirmation}
          text="The task name couldn't be saved. Do you want to discard it and stop editing?"
          confirmLabel="Discard Changes"
          cancelBtnSlot="BtnPrimary"
          confirmBtnSlot="BtnDanger"
          style={{
            Panel: {
              width: "15rem",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid rgba(59, 130, 246, 0.8)",
            },
          }}
          overlay={true}
          draggable
        />
      )}
      {draftTagName !== null && (
        <TagModal
          open={draftTagName !== null}
          draftName={draftTagName}
          onSubmit={handleCreateTag}
          onOpenChange={(newValue) =>
            newValue === false && setDraftTagName(null)
          }
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          open={showCategoryModal}
          onSubmit={handleCreateCategory}
          onOpenChange={setShowCategoryModal}
        />
      )}
    </OptionalPortal>
  );
}
