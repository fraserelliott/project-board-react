import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useProject } from "@/contexts/ProjectContext";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { useFEStyles } from "@fraserelliott/fe-components";
import { AlertTriangle, LockKeyhole } from "lucide-react";

export default function DependencyDisplay({
  taskId,
  dependencyIds,
  showRemoveBtn,
  onRemove,
}) {
  const { getTask, isBlockedBy, hasStaleDependency } = useProject();
  const { styleComponent } = useFEStyles();

  return (
    <div
      style={sx(
        utilities["fe-d-flex"],
        utilities["fe-gap-2"],
        utilities["fe-flex-wrap"],
      )}
    >
      {dependencyIds.map((dependencyId) => {
        const task = getTask(dependencyId);
        const isBlocked = isBlockedBy(taskId, task.id);
        const isMadeStale = hasStaleDependency(taskId, task.id);

        const icon = isBlocked ? (
          <LockKeyhole size={16} color="#f87171" />
        ) : isMadeStale ? (
          <AlertTriangle size={16} color="#F59E0B" />
        ) : null;
        return (
          <span
            key={dependencyId}
            style={sx(
              utilities["fe-rounded-2"],
              utilities["fe-px-2"],
              utilities["fe-d-inline-flex"],
              utilities["fe-gap-2"],
              utilities["fe-py-1"],
              utilities["fe-items-center"],
              feSlateStyles.BGDropdown,
              isBlocked && { border: "1px solid #f87171" },
              isMadeStale && {
                border: "1px solid #F59E0B",
              },
            )}
          >
            {!showRemoveBtn && icon}
            {task.name}
            {showRemoveBtn && (
              <button
                {...styleComponent("BtnDanger", {
                  opacity: "0.5",
                  paddingTop: null,
                  paddingBottom: null,
                  fontSize: "0.8em",
                })}
                onClick={() => onRemove?.(dependencyId)}
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
