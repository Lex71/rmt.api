import { NextFunction, Request, Response } from "express";

// const facilityQuery = (routes: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (routes.includes(req.path)) {
//       if (!req.query.facility && req.user && req.user.facility) {
//         req.query.facility = req.user.facility; // assuming req.user.facility is set
//       }
//     }
//     next();
//   };
// };
const facilityQuery = (routes: RegExp[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (routes.some((route) => route.test(req.path))) {
      if (!req.query.facility && req.user?.facility) {
        req.query.facility = req.user.facility;
      }
    }
    next();
  };
};

export default facilityQuery;
