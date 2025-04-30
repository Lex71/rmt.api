import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config.ts";
import { ApplicationError } from "../utils/errors.ts";

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  // const authHeader = req.headers.authorization;
  // const token = authHeader?.split(" ")[1];
  let token = null;
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
    // } else if (req.signedCookies.accessToken) {
    //   token = req.signedCookies.accessToken as string;
    // } else if (req.cookies.accessToken) {
    //   token = req.cookies.accessToken as string;
  }

  if (!token) {
    next(new ApplicationError(401, "Unauthorized"));
  } else {
    jwt.verify(token, config.JWT_SECRET, (err, user) => {
      if (err) {
        next(new ApplicationError(401, err.message));
      } else {
        if (user == null) {
          next(new ApplicationError(500, "User not found"));
        }
        req.user = user as Express.User;
        next();
      }
    });
  }
}

function checkNotAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let token = null;
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
    // } else if (req.signedCookies.accessToken) {
    //   token = req.signedCookies.accessToken as string;
    // } else if (req.cookies.accessToken) {
    //   token = req.cookies.accessToken as string;
  }

  if (!token) {
    next();
  } else {
    jwt.verify(token, config.JWT_SECRET, (err) => {
      if (err) {
        next();
      }
    });
  }
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  let token = null;
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
    // } else if (req.signedCookies.accessToken) {
    //   token = req.signedCookies.accessToken as string;
    // } else if (req.cookies.accessToken) {
    //   token = req.cookies.accessToken as string;
  }

  if (!token) {
    // next("Forbidden");
    next(new ApplicationError(401, "Unauthorized"));
  } else {
    jwt.verify(token, config.JWT_SECRET, (err, user) => {
      if (err) {
        next(new ApplicationError(401, "Unauthorized"));
      } else {
        if (user == null) {
          next(new ApplicationError(500, "User not found"));
        }
        // req.user = user; // automatically set
        if (typeof user === "object" && "role" in user) {
          if (user.role === "admin") {
            next();
          } else {
            next(new ApplicationError(403, "User is not admin"));
          }
        } else {
          next(new ApplicationError(500, "User object not found"));
        }
      }
    });
  }
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
