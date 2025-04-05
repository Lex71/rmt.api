import express from "express";

// TODO: import theese for jwt auth
// loginUser,
// refreshToken,
// whoami,
import {
  logoutUser,
  newLogin,
  newRegister,
  passportLogin,
  registerUser,
} from "../controllers/authController";
import { checkAuthenticated, checkNotAuthenticated } from "../middlewares/auth";
import validate from "../middlewares/validator";

const router = express.Router();

// login view
router.get("/login", checkNotAuthenticated, newLogin);

// register view
router.get("/register", checkNotAuthenticated, newRegister);

// register submit
router.post(
  "/register",
  checkNotAuthenticated,
  validate("auth/register"),
  // (req: Request, res: Response, next: NextFunction) => {
  //   console.log(`BODY: ${JSON.stringify(req.body)}`);
  //   // next();
  //   const { name, email } = req.body;
  //   res.render("auth/register", {
  //     user: { name, email },
  //     messages: "Auth ERROR",
  //   });
  // },
  registerUser,
);

// login submit
router.post("/login", checkNotAuthenticated, passportLogin());
// router.post(
//   "/login",
//   checkNotAuthenticated,
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/auth/login",
//     failureFlash: true,
//   }),
// );

// logout
router.delete("/logout", checkAuthenticated, logoutUser);

// TODO: check theese
// router
//   .route("/token")
//   .post(validator.loginValidationRules, validator.validate, loginUser);

// router
//   .route("/token/refresh")
//   .post(
//     validator.refreshTokenValidationRules,
//     validator.validate,
//     refreshToken,
//   );

// router
//   .route("/whoami")
//   .get(passport.authenticate(["jwt", "basic"], { session: false }), whoami);

export default router;
