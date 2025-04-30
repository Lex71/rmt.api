import express /* , { Request, Response } */ from "express";
import { getIndexData } from "../controllers/indexController.ts";

const router = express.Router();

import { checkAuthenticated } from "../middlewares/auth.ts";

// router.get("/free", (req: Request, res: Response) => {
//   res.status(200).json({
//     data: [
//       { address: "via Uno", name: "Facility 1" },
//       { address: "via Due", name: "Facility 2" },
//     ],
//   });
// });

router.get("/index", checkAuthenticated, getIndexData);

export default router;
