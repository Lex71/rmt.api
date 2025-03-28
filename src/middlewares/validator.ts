import { NextFunction, Request, Response } from "express";
// import * as yup from "yup";
import { ValidationError } from "yup";
import schemas from "../schemas/schema-yup";

/**
 * TransformYupErrorsIntoObject
 *
 * @description Transform the useless yup error into a useable validation object
 * @param {ValidationError} errors Yup validation errors
 * @returns {Record<string, string>} Validation errors
 */
const transformYupErrorsIntoObject = (
  errors: ValidationError,
): Record<string, string> => {
  const validationErrors: Record<string, string> = {};

  errors.inner.forEach((error: any) => {
    if (error.path !== undefined) {
      validationErrors[error.path] = error.errors[0];
    }
  });

  return validationErrors;
};
const transformYupErrorsIntoHTMLString = (errors: ValidationError): string => {
  let validationErrors: string = "";

  errors.inner.forEach((error: any) => {
    if (error.path !== undefined) {
      validationErrors += "<li>" + error.errors[0] + "</li>";
    }
  });

  return validationErrors;
};

const transformYupErrorsIntoString = (errors: ValidationError): string => {
  let validationErrors: string = "";

  errors.inner.forEach((error: any) => {
    if (error.path !== undefined) {
      validationErrors += error.errors[0] + "\n";
    }
  });

  return validationErrors ? `<ul>${validationErrors}</ul>` : "";
};

const validate =
  // (schema: yup.Schema) =>
  function (path: string) {
    const schema = schemas[path];

    if (!schema) {
      throw new Error(`Schema not found for path: ${path}`);
    }

    return async (req: Request, res: Response, next: NextFunction) => {
      const body = req.body;
      // const { name, email } = req.body;
      try {
        await schema.validate(body, { abortEarly: false });
        next();
      } catch (error) {
        // const err = transformYupErrorsIntoObject(error as ValidationError);
        const err = transformYupErrorsIntoHTMLString(error as ValidationError);
        // const err = transformYupErrorsIntoString(error as ValidationError);
        console.log(err);
        req.flash("error", err);
        // since I don't redirect, simply flash immediately
        res.render("auth/register", { data: { user: { ...req.body } } });
      }
    };
  };
export default validate;
