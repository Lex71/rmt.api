/**
 *
 * FUTURE: maybe I'll be using Zod, but not now unitl feature like yup.abortEarly is missing
 *  https://github.com/colinhacks/zod/issues/127
 * 
 * The implementation hoever works, just lacks to format error like I do for yup:
 * {
    "email": "Invalid email format",
    "name": "Name must be at least 3 characters",
    "password": "Password must contain at least 1 UPPERCASE char, 1 number and 1 special char: !.@#$%^&*"
  }
 *
 */
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, /* ZodRawShape, */ ZodError } from "zod";
import schemas from "../schemas/schema-zod";

function matchInArray(str: string, expressions: string[]) {
  const isMatch = expressions.some((rx) => new RegExp(rx).test(str));

  if (isMatch) {
    const matchingRegex = expressions.find((rx) => new RegExp(rx).test(str));
    return matchingRegex; // This will output the matching regex
  }
  return "";
}

// export function zodMiddleware(
//   err: unknown,
//   _req: Request,
//   res: Response,
//   next: NextFunction,
// ): void {
//   if (!err) {
//     next();
//     return;
//   }
//   if (err instanceof z.ZodError) {
//     res.status(400).json({
//       error: err.flatten(),
//     });
//     return;
//   } else if (err instanceof Error) {
//     const error = err as Error & { statusCode?: number };
//     res.status(error.statusCode ?? 400).json({
//       message: err.message,
//     });
//     return;
//   }
//   res.status(500).json({
//     message: "Internal server error",
//   });
// }

export const validateZod =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body as AnyZodObject,
        params: req.params,
        query: req.query,
      });
      next();
      return;
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        // return res.status(400).send(e.errors);
        return res.status(400).send(e.format());
      }
      return res.status(400).send("Invalid data");
    }
  };

export const validate = function (path: string, method: string) {
  const found = matchInArray(path, Object.keys(schemas[method]));
  if (!found) {
    throw new Error(`Schema not found for path: ${path}`);
  }

  const schema = schemas[method][found];

  return validateZod(schema);
};
export default validate;
