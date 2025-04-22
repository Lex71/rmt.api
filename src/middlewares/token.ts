import { NextFunction, Request, Response } from "express";

function setToken(req: Request, res: Response, next: NextFunction) {
  const token = "your-generated-token"; // Replace with your actual token generation logic
  res.cookie("authToken", token, {
    httpOnly: true, // Ensures the cookie is not accessible via JavaScript
    maxAge: 24 * 60 * 60 * 1000, // Token expires in 24 hours
    sameSite: "strict", // Helps prevent CSRF attacks
    secure: true, // Ensures the cookie is only sent over HTTPS (set to false for development)
  });
  next();
}

export { setToken };
