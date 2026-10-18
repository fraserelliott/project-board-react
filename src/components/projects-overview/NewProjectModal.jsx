import {
  OptionalPortal,
  Modal,
  useFEStyles,
  useToast,
} from "@fraserelliott/fe-components";
import { useForm } from "react-hook-form";
import { sx, utilities } from "@fraserelliott/fe-utilities";
import { useState } from "react";
import { useProjects } from "@/contexts/ProjectsContext";

export function NewProjectModal({ open, onOpenChange }) {
  const { register, handleSubmit } = useForm();
  const { styleComponent } = useFEStyles();
  const [isValidName, setIsValidName] = useState(null);
  const { isNameValid, addProject } = useProjects();
  const { addToastMessage } = useToast();

  const createProject = (data) => {
    const name = data.name.trim();
    const validName = isNameValid(name);
    if (!validName.valid) {
      addToastMessage(validName.reason, "error");
      return setIsValidName(validName);
    }
    addProject(name);
    onOpenChange(false);
  };

  return (
    <OptionalPortal>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        heading="New Project"
        showCloseButtons="corner"
        overlay={true}
        closeOnEscape
        draggable
        style={{
          Panel: {
            width: "400px",
            height: "250px",
            border: "1px solid rgba(59, 130, 246, 0.8)",
          },
        }}
      >
        <form
          onSubmit={handleSubmit(createProject)}
          style={sx(
            utilities["fe-d-flex"],
            utilities["fe-flex-column"],
            utilities["fe-items-center"],
            utilities["fe-gap-2"],
          )}
        >
          <label htmlFor="name">Name: </label>
          <input
            id="name"
            {...styleComponent("InputPrimary", utilities["fe-w-100"])}
            {...register("name", {
              onChange: () => setIsValidName(null),
              onBlur: (event) =>
                event.target.value.trim() !== "" &&
                setIsValidName(isNameValid(event.target.value)),
            })}
          />
          <div style={{ height: "1.5em" }}>
            {isValidName?.valid === true && (
              <p style={{ color: "#4caf50" }}>Name is valid.</p>
            )}
            {isValidName?.valid === false && (
              <p style={{ color: "#d9534f" }}>{isValidName.reason}</p>
            )}
          </div>
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
