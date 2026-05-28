import express from "express";
import { 
    updateReturnStatus, 
    getReturnTracking, 
    createNewReturnRequest, 
    getAllReturns,
    reviewReturnRequest
} from "../controllers/returnController.js";
import { mockAuthCheck } from "../middleware/integrationHooks.js";

const returnRoutes = express.Router();


returnRoutes.post("/request", createNewReturnRequest);
returnRoutes.put("/:returnId/review", reviewReturnRequest);
returnRoutes.put("/:returnId/status", mockAuthCheck, updateReturnStatus);
returnRoutes.get("/track/:returnId", getReturnTracking);
returnRoutes.get("/all", getAllReturns);

export default returnRoutes;