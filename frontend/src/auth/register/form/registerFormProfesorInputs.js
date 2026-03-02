import { formValidators } from "../../../validators/formValidators";

export const registerFormProfesorInputs = [
  {
    tag: "Username",
    name: "username",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Password",
    name: "password",
    type: "password",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "First Name",
    name: "firstName",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Last Name",
    name: "lastName",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
    {
    tag: "DNI",
    name: "dni",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
    {
    tag: "Phone number",
    name: "telephone",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [],
  },
  
];
