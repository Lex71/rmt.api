import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { ApplicationError } from "../utils/errors";

/**
 * Middleware to check if a request is authenticated.
 * Checks if a request has a valid JWT auth token.
 * If the token is valid, sets the `req.user` property to the user object.
 * If the token is invalid, sends a 401 Unauthorized response.
 * If the token is missing, sends a 401 Unauthorized response.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
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
          return;
        }
        req.user = user as Express.User;
        next();
      }
    });
  }
}

/**
 * Middleware to check if the user is not authenticated.
 * If the request does not contain a valid JWT token, the middleware proceeds to the next handler.
 * If a JWT token is present and valid, it responds with a message indicating the user is already logged in.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */

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
      } else {
        res.status(200).json({ message: "Already logged in" });
      }
    });
  }
}

/**
 * Middleware to verify if the user has admin privileges.
 *
 * Extracts and verifies the JWT token from the request's authorization header.
 * If the token is valid and the user's role is "admin", the request proceeds to the next middleware.
 * If the token is missing or invalid, or if the user is not an admin, an appropriate error response is sent.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */

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
          return;
        }
        // req.user = user; // automatically set
        if (typeof user === "object" && "role" in user) {
          if (user.role === "admin") {
            req.user = user as Express.User;
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

export { checkAuthenticated, checkNotAuthenticated, isAdmin };
