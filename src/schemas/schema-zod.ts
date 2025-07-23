import { z } from "zod";
// // schema.ts
// import { Status } from "../models/reservation";

const PASSWORD_REGEX = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})/,
);

const EMAIL_REGEX = new RegExp(
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
);

/* const authRegister = z.object().shape({
  // firstName: z
  //   .string()
  //   .min(2, "Too Short!")
  //   .max(50, "Too Long!")
  //   .required("Required first name")
  //   .matches(/^[a-zA-Z]+$/, "Invalid first name format"),
  // lastName: z
  //   .string()
  //   .min(2, "Too Short!")
  //   .max(50, "Too Long!")
  //   .required("Required last name")
  //   .matches(/^[a-zA-Z]+$/, "Invalid last name format"),
  email: z
    .string()
    .email("Invalid email address")
    .required("Email is required email")
    .matches(EMAIL_REGEX, "Invalid email format"),
  password: z
    .string()
    .matches(PASSWORD_REGEX, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

const authLogin = z.object().shape({
  email: z
    .string()
    .email("Invalid email address")
    .required("Email is required email")
    .matches(EMAIL_REGEX, "Invalid email format"),
  password: z
    .string()
    .matches(PASSWORD_REGEX, "Password must be at least 8 characters long.")
    .required("Password is required."),
});

export default {
  "/auth/login": authLogin,
  "/auth/new": authRegister,
  "/facilities": facility,
} as { [key: string]: z.ObjectSchema<z.AnyObject> };
*/

// export const userSchema = z.object({
//   // .required("Name is required")
//   email: z
//     .string()
//     //.email("Invalid email")
//     .required("Email is required")
//     .matches(EMAIL_REGEX, "Invalid email format"),
//   name: z.string().min(3, "Name must be at least 3 characters"),
//   password: z
//     .string()
//     .matches(
//       PASSWORD_REGEX,
//       "Password must contain at least 1 UPPERCASE char, 1 number and 1 special char: !.@#$%^&*",
//     ),
//   // .required("Password is required"),
//   // .min(8, "Password must be at least 8 characters"),
// });

// // const authSchema = z.object({
// //   email: z
// //     .string()
// //     .email("Invalid email address")
// //     .required("Email is required email")
// //     .matches(EMAIL_REGEX, "Invalid email format"),
// //   password: z
// //     .string()
// //     .matches(PASSWORD_REGEX, "Password must be at least 8 characters long.")
// //     .required("Password is required."),
// // });

// const facilitySchema = z.object({
//   address: z
//     .string()
//     .min(2, "Too Short!")
//     .max(100, "Too Long!")
//     .required("Required address")
//     .matches(/^[a-zA-Z0-9-\s,.\\/()]+$/, "Invalid address format"),
//   name: z
//     .string()
//     .min(2, "Too Short!")
//     .max(100, "Too Long!")
//     .required("Required name"),
// });

// const reservationSchema = z.object({
//   date: z
//     .string()
//     .required("Required date")
//     .matches(
//       /^\d{4}-(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
//       "Invalid date",
//     ),
//   name: z
//     .string()
//     .min(2, "Too Short!")
//     .max(50, "Too Long!")
//     .required("Required name")
//     .matches(/^[a-zA-Z]+$/, "Invalid name format"),
//   status: z
//     .mixed<Status>()
//     .oneOf(Object.values(Status), "Invalid status")
//     .required("Status required"),
//   time: z
//     .string()
//     .required("Required time")
//     .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time"),
// });

// const tableSchema = z.object({
//   // facility: z.string().required("Required Facility"),
//   name: z
//     .string()
//     .min(2, "Too Short!")
//     .max(50, "Too Long!")
//     .required("Required name")
//     .matches(/^[a-zA-Z]+$/, "Invalid name format"),
//   seats: z.number().min(2, "Too Short!").required("Required seats"),
// });

// // export default {
// //   "auth/new": userSchema,
// //   // "auth/login": authSchema,
// //   facilities: facilitySchema,
// //   "reservations/(.*)": reservationSchema,
// // } as Record<string, z.ObjectSchema<z.AnyObject>>;
// export default {
//   patch: {
//     "facilities/(.*)": facilitySchema.clone().partial(),
//     "reservations/(.*)": reservationSchema.clone().partial(),
//     "tables/(.*)": tableSchema.clone().partial(),
//   },
//   post: {
//     auth: userSchema,
//     facilities: facilitySchema,
//     reservations: reservationSchema.clone().omit(["status"]),
//     tables: tableSchema,
//   },
//   put: {
//     "facilities/(.*)": facilitySchema,
//     "reservations/(.*)": reservationSchema,
//     "tables/(.*)": tableSchema,
//   },
// } as Record<string, Record<string, z.ObjectSchema<z.AnyObject>>>;

// END NEW

// const bodySchema = z.object({
//   confirmPassword: z.string().min(8).regex(PASSWORD_REGEX),
//   email: z.string().email(),
//   name: z.string().min(2).max(50),
//   password: z.string().min(8).regex(PASSWORD_REGEX),
//   role: z.enum(["USER", "ADMIN"]),
// })

// const result = bodySchema.safeParse({
//   confirmPassword: "password",
//   email: "email",
//   name: "name",
//   password: "password",
//   role: "USER",
// });

const userSchema = z.object({
  body: z.object({
    email: z
      .string({
        invalid_type_error: "Email must be a string",
        required_error: "Email is required",
      })
      .email("Invalid email")
      .regex(EMAIL_REGEX, "Invalid email format"),
    // .required("Email is required")
    name: z.string().min(3, "Name must be at least 3 characters"), //.optional(),
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least 1 UPPERCASE char, 1 number and 1 special char: !.@#$%^&*",
      ),
  }),
  // email: z
  //   .string({
  //     invalid_type_error: "Email must be a string",
  //     required_error: "Email is required",
  //   })
  //   .email("Invalid email")
  //   .regex(EMAIL_REGEX, "Invalid email format"),
  // // .required("Email is required")
  // name: z.string().min(3, "Name must be at least 3 characters"), //.optional(),
  // password: z
  //   .string()
  //   .regex(
  //     PASSWORD_REGEX,
  //     "Password must contain at least 1 UPPERCASE char, 1 number and 1 special char: !.@#$%^&*",
  //   ),
});
export type UserSchema = z.infer<typeof userSchema>;

/* export const createArticleSchema = z.object({
  body: z.object({
    content: z.string({ required_error: 'Content is required' }),
    title: z.string({ required_error: 'Title is required' }),
  }),
});
export type CreateArticleInput = z.infer<typeof createArticleSchema.shape.body>; 
*/

export default {
  patch: {
    // "facilities/(.*)": facilitySchema.clone().partial(),
    // "reservations/(.*)": reservationSchema.clone().partial(),
    // "tables/(.*)": tableSchema.clone().partial(),
  },
  post: {
    auth: userSchema,
    // facilities: facilitySchema,
    // reservations: reservationSchema.clone().omit(["status"]),
    // tables: tableSchema,
  },
  put: {
    // "facilities/(.*)": facilitySchema,
    // "reservations/(.*)": reservationSchema,
    // "tables/(.*)": tableSchema,
  },
} as Record<string, Record<string, z.ZodObject<z.ZodRawShape>>>;
