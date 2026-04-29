import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import auditRouter from "./audit";
import encountersRouter from "./encounters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(auditRouter);
router.use(encountersRouter);

export default router;
