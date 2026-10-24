import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useProject } from "@/contexts/ProjectContext";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { useFEStyles } from "@fraserelliott/fe-components";
import ContextMenu from "../ContextMenu";
import { useState } from "react";
import TagModal from "./TagModal";

export default function TagDisplay({ tagIds, showRemoveBtn, onRemove }) {
  const { getTag, updateTag } = useProject();
  const { styleComponent } = useFEStyles();
  const [tagModalData, setTagModalData] = useState(null);

  return (
    <div
      style={sx(
        utilities["fe-d-flex"],
        utilities["fe-gap-2"],
        utilities["fe-flex-wrap"],
      )}
    >
      {tagIds.map((tagId) => {
        const tag = getTag(tagId);
        return (
          <ContextMenu
            items={[
              { label: "Edit Tag", onClick: () => setTagModalData(tag) },
              ...(onRemove
                ? [{ label: "Remove", onClick: () => onRemove(tagId) }]
                : []),
            ]}
          >
            <span
              key={tagId}
              style={sx(
                utilities["fe-rounded-2"],
                utilities["fe-px-2"],
                utilities["fe-d-inline-flex"],
                utilities["fe-gap-2"],
                utilities["fe-py-1"],
                utilities["fe-items-center"],
                feSlateStyles.BGDropdown,
                {
                  border: `1px solid ${tag.color ?? "white"}`,
                },
              )}
            >
              {tag.name}
              {showRemoveBtn && (
                <button
                  {...styleComponent("BtnDanger", {
                    opacity: "0.5",
                    paddingTop: null,
                    paddingBottom: null,
                    fontSize: "0.8em",
                  })}
                  onClick={() => onRemove?.(tagId)}
                >
                  x
                </button>
              )}
            </span>
          </ContextMenu>
        );
      })}
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
    </div>
  );
}
