import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useProject } from "@/contexts/ProjectContext";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { useFEStyles } from "@fraserelliott/fe-components";

export default function TagDisplay({ tagIds, showRemoveBtn, onRemove }) {
  const { getTag } = useProject();
  const { styleComponent } = useFEStyles();

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
              tag.color && {
                border: `1px solid ${tag.color}`,
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
        );
      })}
    </div>
  );
}
