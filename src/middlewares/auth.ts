import { NextFunction, Request, Response } from "express";
// TODO: enable for jwt validation
// const jwt = require('jsonwebtoken');

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  res.redirect("/auth/login");
}

function checkNotAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.isAuthenticated()) {
    res.redirect("/");
    return;
  }
  next();
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    next();
    return;
  }

  res.redirect("/auth/login");
}

// TODO: enable for jwt validation
// Middleware for JWT validation
// function verifyToken(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).json({ error: 'Unauthorized' });
//   jwt.verify(token, 'secret', (err, decoded) => {
//     if (err) return res.status(401).json({ error: 'Unauthorized' });
//     req.user = decoded;
//     next();
//   });
// };

export { checkAuthenticated, checkNotAuthenticated, isAdmin };
