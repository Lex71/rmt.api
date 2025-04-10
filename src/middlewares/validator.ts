import { NextFunction, Request, Response } from "express";
// import * as yup from "yup";
import { AnyObject, ValidationError } from "yup";

import schemas from "../schemas/schema-yup";

/**
 * TransformYupErrorsIntoObject
 *
 * @description Transform the useless yup error into a useable validation object
 * @param {ValidationError} errors Yup validation errors
 * @returns {Record<string, string>} Validation errors
 */
/* const transformYupErrorsIntoObject = (
  errors: ValidationError,
): Record<string, string> => {
  const validationErrors: Record<string, string> = {};

  errors.inner.forEach((error: any) => {
    if (error.path !== undefined) {
      validationErrors[error.path] = error.errors[0];
    }
  });

  return validationErrors;
}; */
const transformYupErrorsIntoHTMLString = (errors: ValidationError): string => {
  let validationErrors = "";

  errors.inner.forEach((error: ValidationError) => {
    if (error.path !== undefined) {
      validationErrors += "<li>" + error.errors[0] + "</li>";
    }
  });

  return validationErrors;
};

/* const transformYupErrorsIntoString = (errors: ValidationError): string => {
  let validationErrors: string = "";

  errors.inner.forEach((error: any) => {
    if (error.path !== undefined) {
      validationErrors += error.errors[0] + "\n";
    }
  });

  return validationErrors ? `<ul>${validationErrors}</ul>` : "";
}; */

function matchInArray(str: string, expressions: string[]) {
  /* const fullExpr = new RegExp(
    expressions.map((x) => new RegExp(x).source).join("|"),
  );
  return str.match(fullExpr); */
  const isMatch = expressions.some((rx) => new RegExp(rx).test(str));

  if (isMatch) {
    const matchingRegex = expressions.find((rx) => new RegExp(rx).test(str));
    return matchingRegex; // This will output the matching regex
  }
  return "";
}

const validate =
  // (schema: yup.Schema) =>
  function (path: string, method: string) {
    // if (!Object.keys(schemas).includes(path)) {
    //   throw new Error(`Schema not found for path: ${path}`);
    // }
    const found = matchInArray(path, Object.keys(schemas[method]));
    if (!found) {
      throw new Error(`Schema not found for path: ${path}`);
    }

    const schema = schemas[method][found];

    return async (req: Request, res: Response, next: NextFunction) => {
      const body = req.body as AnyObject;
      // const { name, email } = req.body;
      try {
        await schema.validate(body, { abortEarly: false });
        next();
      } catch (error) {
        // const err = transformYupErrorsIntoObject(error as ValidationError);
        const err = transformYupErrorsIntoHTMLString(error as ValidationError);
        // const err = transformYupErrorsIntoString(error as ValidationError);
        req.flash("error", err);
        let url = req.baseUrl;
        switch (req.method) {
          case "PUT":
          case "PATCH":
            url += req.path + "edit";
            break;
          case "POST":
            url += req.path + "new";
            break;
          default:
            break;
        }
        // req.baseUrl+req.path+(req.method == 'PUT' ? "edit" : "new")
        // since I don't redirect, simply flash immediately
        // res.render(path, { data: { ...body } });
        // in order to render every view, i should provide all data, which here i cannot be aware of => must redirect
        res.redirect(url);
      }
    };
  };
export default validate;
