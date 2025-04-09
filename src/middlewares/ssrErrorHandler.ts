import { NextFunction, Request, Response } from "express";

interface Params {
  render?: string;
  messages: string;
  redirect?: string;
}
export function ssrErrorHandler(params: Params) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(params);
    if (params.messages) {
      res.locals.messages = params.messages;
    }
    if (params.redirect && params.redirect !== "") {
      res.redirect(params.redirect);
    } else if (params.render && params.render !== "") {
      res.render(params.render);
    }
    next();
  };
}
export default ssrErrorHandler;
