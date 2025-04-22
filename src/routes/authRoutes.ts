import express from "express";

// TODO: import theese for jwt auth
// loginUser,
// refreshToken,
// whoami,
import {
  // newLogin,
  // newRegister,
  // passportLogin,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../controllers/authController.ts";
import {
  checkAuthenticated,
  checkNotAuthenticated,
} from "../middlewares/auth.ts";
import validate from "../middlewares/validator.ts";

const router = express.Router();

// login view
// router.get("/login", checkNotAuthenticated, newLogin);

// register view
// router.get("/new", checkNotAuthenticated, newRegister);

// register submit
router.post(
  "/",
  checkNotAuthenticated,
  validate("auth/new", "post"),
  // (req: Request, res: Response, next: NextFunction) => {
  //   console.log(`BODY: ${JSON.stringify(req.body)}`);
  //   // next();
  //   const { name, email } = req.body;
  //   res.render("auth/new", {
  //     user: { name, email },
  //     messages: "Auth ERROR",
  //   });
  // },
  registerUser,
);

// login submit
router.post("/login", checkNotAuthenticated, loginUser);
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

router.route("/refresh").post(
  // validator.refreshTokenValidationRules,
  // validator.validate,
  refreshToken,
);

// router
//   .route("/whoami")
//   .get(passport.authenticate(["jwt", "basic"], { session: false }), whoami);

export default router;
