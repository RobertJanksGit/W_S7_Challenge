import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import axios from "axios";

const initialFormValues = {
  fullName: "",
  size: "",
  toppings: [],
};
const initialFormErrors = {
  fullName: "",
  size: "",
};
const initialDisabled = true;

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

// 👇 Here you will create your schema.
const formSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    // .required("full name required")
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: Yup.string().oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

export default function Form() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [disabled, setDisabled] = useState(initialDisabled);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = (name, value) => {
    Yup.reach(formSchema, name)
      .validate(value)
      .then(() => setFormErrors({ ...formErrors, [name]: "" }))
      .catch((err) => setFormErrors({ ...formErrors, [name]: err.errors[0] }));
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:9009/api/order",
        formValues
      );
      setSuccessMessage(res.data.message);
    } catch (err) {
      setErrorMessage(err.response.data.message);
    } finally {
      setFormValues(initialFormValues);
    }
  };

  const onChange = (evt) => {
    let { name, value, type } = evt.target;

    value = value.trim();

    if (type !== "checkbox") {
      validate(name, value);
      setFormValues({ ...formValues, [name]: value });
    } else {
      const newArray = formValues[name].includes(value)
        ? formValues[name].filter((v) => v !== value)
        : [...formValues[name], value];
      setFormValues({
        ...formValues,
        [name]: newArray,
      });
    }
  };

  useEffect(() => {
    console.log(formValues);
    formSchema
      .isValid(formValues)
      .then((valid) => setDisabled(!valid))
      .catch((err) => console.error(err));
  }, [formValues]);

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {successMessage && <div className="success">{successMessage}</div>}
      {errorMessage && <div className="failure">{errorMessage}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            placeholder="Type full name"
            id="fullName"
            name="fullName"
            type="text"
            onChange={onChange}
            value={formValues.fullName}
          />
        </div>
        {formValues.fullName.length < 3 && (
          <div className="error">{formErrors.fullName}</div>
        )}
        {formValues.fullName.length > 20 && (
          <div className="error">{formErrors.fullName}</div>
        )}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select
            name="size"
            id="size"
            onChange={onChange}
            value={formValues.size}
          >
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {!formValues.size && <div className="error">{formErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((topping) => {
          return (
            <label key={topping.topping_id}>
              <input
                name="toppings"
                type="checkbox"
                onChange={onChange}
                value={topping.topping_id}
                checked={formValues.toppings.includes(topping.topping_id)}
              />
              {topping.text}
              <br />
            </label>
          );
        })}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input disabled={disabled} type="submit" />
    </form>
  );
}
