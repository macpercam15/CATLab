import { formValidators } from "../../../validators/formValidators";
import { registerFormProfesorInputs } from "./registerFormProfesorInputs";

export const registerFormVetInputs = [
  ...registerFormProfesorInputs,
  {
    tag: "City",
    name: "city",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Clinic",
    name: "clinic",
    type: "select",
    values: ["None"],
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator, formValidators.notNoneTypeValidator],
  },
];
