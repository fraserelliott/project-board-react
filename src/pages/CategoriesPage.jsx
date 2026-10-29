import { useProject } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import {
  ActionTable,
  useFEStyles,
  ConfirmDialog,
  OptionalPortal,
} from "@fraserelliott/fe-components";
import { utilities } from "@fraserelliott/fe-utilities";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { useMemo, useState, useEffect } from "react";
import { CategoryModal } from "@/components/project/CategoryModal";

export default function CategoriesPage() {
  const {
    project,
    loading,
    error,
    countCategoryUsage,
    deleteCategory,
    updateCategory,
  } = useProject();
  const navigate = useNavigate();
  const { styleComponent } = useFEStyles();
  const [categoryModalData, setCategoryModalData] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const stortedCategories = useMemo(() => {
    if (!project?.categories) return [];
    return project?.categories.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [project?.categories]);

  useEffect(() => {
    if (!loading && !error && !project) navigate("/");
  }, [loading, error, project]);

  if (loading || error) return null;

  const handleDelete = () => {
    deleteCategory(pendingDelete.id);
    setPendingDelete(null);
  };

  const columns = [
    { field: "name", label: "Name" },
    {
      field: "count",
      label: "Task Count",
      renderItem: (category) => {
        const count = countCategoryUsage(category.id);
        return (
          <span
            style={
              count > 0 ? feSlateStyles.TextPrimary : feSlateStyles.TextMuted
            }
          >
            {count}
          </span>
        );
      },
    },
  ];

  const actions = [
    { key: 0, label: "Edit", onAction: setCategoryModalData },
    {
      key: 1,
      label: "Delete",
      onAction: setPendingDelete,
      buttonStyleSlot: "BtnDanger",
    },
  ];

  return (
    <div style={utilities["fe-p-3"]}>
      <div {...styleComponent("Panel")}>
        {stortedCategories.length > 0 ? (
          <ActionTable
            columns={columns}
            getKey={(category) => category.id}
            items={stortedCategories}
            actions={actions}
            separateActionColumns
          />
        ) : (
          <p>This project doesn't have any categories yet.</p>
        )}
      </div>
      {categoryModalData && (
        <CategoryModal
          open={categoryModalData != null}
          draftName={categoryModalData.name}
          categoryId={categoryModalData.id}
          buttonLabel="Save"
          onOpenChange={(newValue) =>
            newValue === false && setCategoryModalData(null)
          }
          onSubmit={(name) => {
            updateCategory(categoryModalData.id, name);
            setCategoryModalData(null);
          }}
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
            text="Are you sure you want to delete this category? It will also be removed from all tasks that use it. This cannot be undone."
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
