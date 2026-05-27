import express from "express";
import * as returnController from "../controllers/returnController.js";
import { mockAuthCheck } from "../middleware/integrationHooks.js";

const returnRoutes = express.Router();

returnRoutes.put("/:returnId/status", mockAuthCheck, returnController.updateReturnStatus);

export default returnRoutes;