import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/auth", authRouter);

export default router;
