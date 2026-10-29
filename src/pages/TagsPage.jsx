import { useProject } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import {
  ActionTable,
  useFEStyles,
  ConfirmDialog,
  OptionalPortal,
} from "@fraserelliott/fe-components";
import { utilities, sx } from "@fraserelliott/fe-utilities";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { useMemo, useState, useEffect } from "react";
import TagModal from "@/components/project/TagModal";

export default function TagsPage() {
  const { project, loading, error, countTagUsage, updateTag, deleteTag } =
    useProject();
  const navigate = useNavigate();
  const { styleComponent } = useFEStyles();
  const [tagModalData, setTagModalData] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const sortedTags = useMemo(() => {
    if (!project?.tags) return [];
    return project?.tags.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [project?.tags]);

  useEffect(() => {
    if (!loading && !error && !project) navigate("/");
  }, [loading, error, project]);

  if (loading || error) return null;

  const handleDelete = () => {
    deleteTag(pendingDelete.id);
    setPendingDelete(null);
  };

  const columns = [
    { field: "name", label: "Name" },
    {
      field: "color",
      label: "Color",
      renderItem: (tag) => (
        <div
          style={sx(
            utilities["fe-d-flex"],
            utilities["fe-gap-1"],
            utilities["fe-items-center"],
          )}
        >
          {tag.color && (
            <div
              style={{
                width: "0.8em",
                height: "0.8em",
                backgroundColor: tag.color,
                border: "2px solid white",
              }}
            />
          )}
          <span>{tag.color ?? "None"}</span>
        </div>
      ),
    },
    {
      field: "count",
      label: "Task Count",
      renderItem: (tag) => {
        const count = countTagUsage(tag.id);
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
    { key: 0, label: "Edit", onAction: setTagModalData },
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
        {sortedTags.length > 0 ? (
          <ActionTable
            columns={columns}
            getKey={(tag) => tag.id}
            items={sortedTags}
            actions={actions}
            separateActionColumns
          />
        ) : (
          <p>This project doesn't have any tags yet.</p>
        )}
      </div>
      {tagModalData && (
        <TagModal
          open={tagModalData != null}
          draftName={tagModalData.name}
          draftColor={tagModalData.color}
          tagId={tagModalData.id}
          onSubmit={(tag) => {
            updateTag(tag);
            setTagModalData(null);
          }}
          onOpenChange={(newValue) =>
            newValue === false && setTagModalData(null)
          }
          heading={tagModalData.name}
          buttonLabel="Save"
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
            text="Are you sure you want to delete this tag? It will also be removed from all tasks that use it. This cannot be undone."
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
