// schema.ts
import * as yup from "yup";
import { Status } from "../models/reservation";

const PASSWORD_REGEX = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})/,
);

const EMAIL_REGEX = new RegExp(
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
);

/* const authRegister = yup.object().shape({
  // firstName: yup
  //   .string()
  //   .min(2, "Too Short!")
  //   .max(50, "Too Long!")
  //   .required("Required first name")
  //   .matches(/^[a-zA-Z]+$/, "Invalid first name format"),
  // lastName: yup
  //   .string()
  //   .min(2, "Too Short!")
  //   .max(50, "Too Long!")
  //   .required("Required last name")
  //   .matches(/^[a-zA-Z]+$/, "Invalid last name format"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required email")
    .matches(EMAIL_REGEX, "Invalid email format"),
  password: yup
    .string()
    .matches(PASSWORD_REGEX, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

const authLogin = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required email")
    .matches(EMAIL_REGEX, "Invalid email format"),
  password: yup
    .string()
    .matches(PASSWORD_REGEX, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

export default {
  "/auth/login": authLogin,
  "/auth/new": authRegister,
  "/facilities": facility,
} as { [key: string]: yup.ObjectSchema<yup.AnyObject> };
*/

export const userSchema = yup.object({
  // .required("Name is required")
  email: yup
    .string()
    //.email("Invalid email")
    .required("Email is required")
    .matches(EMAIL_REGEX, "Invalid email format"),
  name: yup.string().min(3, "Name must be at least 3 characters"),
  password: yup
    .string()
    .matches(
      PASSWORD_REGEX,
      "Password must contain at least 1 UPPERCASE char, 1 number and 1 special char: !.@#$%^&*",
    ),
  // .required("Password is required"),
  // .min(8, "Password must be at least 8 characters"),
});

// const authSchema = yup.object({
//   email: yup
//     .string()
//     .email("Invalid email address")
//     .required("Email is required email")
//     .matches(EMAIL_REGEX, "Invalid email format"),
//   password: yup
//     .string()
//     .matches(PASSWORD_REGEX, "Password must be at least 8 characters long.")
//     .required("Password is required."),
// });

const facilitySchema = yup.object({
  address: yup
    .string()
    .min(2, "Too Short!")
    .max(100, "Too Long!")
    .required("Required address")
    .matches(/^[a-zA-Z0-9-\s,.\\/()]+$/, "Invalid address format"),
  name: yup
    .string()
    .min(2, "Too Short!")
    .max(100, "Too Long!")
    .required("Required name"),
});

const reservationSchema = yup.object({
  date: yup
    .string()
    .required("Required date")
    .matches(
      /^\d{4}-(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
      "Invalid date",
    ),
  name: yup
    .string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required name")
    .matches(/^[a-zA-Z]+$/, "Invalid name format"),
  status: yup
    .mixed<Status>()
    .oneOf(Object.values(Status), "Invalid status")
    .required("Status required"),
  time: yup
    .string()
    .required("Required time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time"),
});

const tableSchema = yup.object({
  // facility: yup.string().required("Required Facility"),
  name: yup
    .string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required name")
    .matches(/^[a-zA-Z]+$/, "Invalid name format"),
  seats: yup.number().min(2, "Too Short!").required("Required seats"),
});

// export default {
//   "auth/new": userSchema,
//   // "auth/login": authSchema,
//   facilities: facilitySchema,
//   "reservations/(.*)": reservationSchema,
// } as Record<string, yup.ObjectSchema<yup.AnyObject>>;
export default {
  patch: {
    "facilities/(.*)": facilitySchema.clone().partial(),
    "reservations/(.*)": reservationSchema.clone().partial(),
    "tables/(.*)": tableSchema.clone().partial(),
  },
  post: {
    auth: userSchema,
    facilities: facilitySchema,
    reservations: reservationSchema.clone().omit(["status"]),
    tables: tableSchema,
  },
  put: {
    "facilities/(.*)": facilitySchema,
    "reservations/(.*)": reservationSchema,
    "tables/(.*)": tableSchema,
  },
} as Record<string, Record<string, yup.ObjectSchema<yup.AnyObject>>>;
