import {
  OptionalPortal,
  Modal,
  useFEStyles,
  useToast,
} from "@fraserelliott/fe-components";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useProject } from "@/contexts/ProjectContext";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";

export default function NewTagModal({
  open,
  onOpenChange,
  onCreate,
  draftName = "",
}) {
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      name: draftName,
      color: null,
    },
  });
  const { styleComponent } = useFEStyles();
  const [isValidName, setIsValidName] = useState(null);
  const { isTagNameValid, addTag } = useProject();
  const { addToastMessage } = useToast();

  const createTag = (data) => {
    const name = data.name.trim();
    const validName = isTagNameValid(name);
    if (!validName.valid) {
      addToastMessage(validName.reason, "error");
      return setIsValidName(validName);
    }
    const tagId = addTag(name, data.color);
    if (!tagId) return addToastMessage("Error adding tag.", "error");
    onCreate?.(tagId);
  };

  return (
    <OptionalPortal portalTarget={document.body}>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        showCloseButtons="corner"
        heading="New Tag"
        style={{
          Panel: {
            width: "400px",
            height: "400px",
            border: "1px solid rgba(59, 130, 246, 0.8)",
          },
        }}
        overlay={true}
        draggable
        closeOnEscape
      >
        <form
          onSubmit={handleSubmit(createTag)}
          style={sx(
            utilities["fe-d-flex"],
            utilities["fe-flex-column"],
            utilities["fe-items-center"],
            utilities["fe-gap-3"],
          )}
        >
          <div
            style={sx(
              utilities["fe-d-flex"],
              utilities["fe-flex-column"],
              utilities["fe-w-100"],
              utilities["fe-items-center"],
              utilities["fe-gap-1"],
            )}
          >
            <label htmlFor="name">Name</label>
            <input
              id="name"
              {...styleComponent("InputPrimary", utilities["fe-w-100"])}
              {...register("name", {
                onChange: () => setIsValidName(null),
                onBlur: (event) =>
                  event.target.value.trim() !== "" &&
                  setIsValidName(isTagNameValid(event.target.value)),
              })}
            />
          </div>
          <div style={{ height: "1.5em" }}>
            {isValidName?.valid === true && (
              <p style={{ color: "#4caf50" }}>Name is valid.</p>
            )}
            {isValidName?.valid === false && (
              <p style={{ color: "#d9534f" }}>{isValidName.reason}</p>
            )}
          </div>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                selectedColor={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <input
            type="submit"
            {...styleComponent("BtnPrimary")}
            value="Create"
          />
        </form>
      </Modal>
    </OptionalPortal>
  );
}

const availableColors = [
  { name: "None", color: null },
  { name: "Red", color: "#EF4444" },
  { name: "Orange", color: "#F97316" },
  { name: "Amber", color: "#F59E0B" },
  { name: "Green", color: "#22C55E" },
  { name: "Teal", color: "#14B8A6" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Indigo", color: "#6366F1" },
  { name: "Purple", color: "#8B5CF6" },
  { name: "Pink", color: "#EC4899" },
];

function getColorName(color) {
  return availableColors.find((item) => item.color === color)?.name;
}

function ColorPicker({ onChange, selectedColor }) {
  return (
    <>
      <span>Colour: {getColorName(selectedColor)}</span>
      <div
        style={sx(
          utilities["fe-d-flex"],
          utilities["fe-gap-5"],
          utilities["fe-flex-wrap"],
          utilities["fe-justify-between"],
        )}
      >
        {availableColors.map((option) => (
          <button
            key={option.name}
            type="button"
            title={option.name}
            aria-label={option.name}
            aria-pressed={selectedColor === option.color}
            onClick={() => onChange(option.color)}
            style={{
              width: 28,
              height: 28,
              backgroundColor: option.color ?? "transparent",
              opacity: selectedColor === option.color ? 1 : 0.5,
              border:
                selectedColor === option.color
                  ? "4px solid green"
                  : "2px solid white",
              borderRadius: 4,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </>
  );
}
