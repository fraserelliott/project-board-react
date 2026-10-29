import {
  OptionalPortal,
  Modal,
  useFEStyles,
  useToast,
} from "@fraserelliott/fe-components";
import { useForm } from "react-hook-form";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { formatDateTime } from "@fraserelliott/date-formatter";

export default function ImportTasksModal({ open, onOpenChange }) {
  const { register, handleSubmit } = useForm();
  const { styleComponent } = useFEStyles();
  const [importError, setImportError] = useState(null);
  const { addToastMessage } = useToast();
  const { bulkCreateTasks, isTaskNameValid, addNote } = useProject();

  const validateImport = (json) => {
    let tasks;

    try {
      tasks = JSON.parse(json);
    } catch {
      return "Invalid JSON";
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return "Expected a non-empty array of tasks";
    }

    const names = new Set();

    for (const task of tasks) {
      if (!task || typeof task.name !== "string" || !task.name.trim()) {
        return "Every task must have a name";
      }

      const name = task.name.trim();

      if (!isTaskNameValid(name).valid) {
        return `Task name "${name}" is already in use or invalid`;
      }

      if (names.has(name)) {
        return `Duplicate task name in import: "${name}"`;
      }

      names.add(name);
    }

    return names;
  };

  const handleImport = (data) => {
    const result = validateImport(data.json);

    if (typeof result === "string") {
      addToastMessage(result, "error");
      setImportError(result);
      return;
    }

    bulkCreateTasks([...result]);

    if (data.saveNote) {
      const noteName = `Imported Tasks - ${formatDateTime(
        new Date(),
        "DD-MM-YYYY hh:mm:ss",
      )}`;

      addNote(noteName, `\`\`\`json\n${data.json}\n\`\`\``);
    }

    onOpenChange(false);
  };

  return (
    <OptionalPortal portalTarget={document.body}>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        heading="Import Tasks"
        showCloseButtons="corner"
        overlay={true}
        closeOnEscape
        draggable
        style={{
          Panel: {
            width: "800px",
            height: "600px",
            border: "1px solid rgba(59, 130, 246, 0.8)",
          },
        }}
      >
        <form
          onSubmit={handleSubmit(handleImport)}
          style={sx(
            utilities["fe-d-flex"],
            utilities["fe-flex-column"],
            utilities["fe-items-center"],
            utilities["fe-gap-2"],
            utilities["fe-w-100"],
            utilities["fe-h-100"],
          )}
        >
          <textarea
            {...register("json", {
              onChange: () => setImportError(null),
              onBlur: (event) => {
                if (event.target.value.trim() === "") return;

                const result = validateImport(event.target.value.trim());

                if (typeof result === "string") {
                  addToastMessage(result, "error");
                  setImportError(result);
                  return;
                }
              },
            })}
            {...styleComponent(
              "InputPrimary",
              sx(utilities["fe-grow-1"], {
                width: "95%",
              }),
            )}
          />

          <div style={{ height: "1.5em" }}>
            {!importError === false && (
              <p style={{ color: "#d9534f" }}>{importError}</p>
            )}
          </div>

          <label>
            Save Note: <input type="checkbox" {...register("saveNote")} />
          </label>
          <input type="submit" {...styleComponent("BtnPrimary")} />
        </form>
      </Modal>
    </OptionalPortal>
  );
}
