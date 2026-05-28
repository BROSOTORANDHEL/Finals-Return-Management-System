import * as returnService from "../services/returnService.js";
import { triggerExternalNotification } from "../middleware/integrationHooks.js";

export const updateReturnStatus = async (req, res) => {
    const { returnId } = req.params;
    const { status, location, customerId } = req.body; 
    const currentUser = req.user; 

    if (currentUser.role.toLowerCase() !== 'rider') {
        return res.status(403).json({
            success: false,
            message: `Access denied: Only accounts with the 'rider' role can process returns. Your current role is: ${currentUser.role} ❌`
        });
    }

    try {
        const trackingRecord = await returnService.updateReturnStatus(returnId, status, location);

        await triggerExternalNotification("RETURN_STATUS_CHANGED", {
            returnId: returnId,
            newStatus: status,
            notifiedCustomerId: customerId,
            processedByRider: currentUser.id
        });

        return res.status(200).json({
            success: true,
            message: "Return status updated and notification layer triggered successfully!",
            data: {
                returnId,
                status,
                location: trackingRecord.location,
                updatedBy: currentUser.id
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An internal error occurred while updating the return status.",
            error: error.message
        });
    }
};

export const getReturnTracking = async (req, res) => {
    try {
        const { returnId } = req.params;
        const trackingInfo = await returnService.getTrackingInfo(returnId);
        
        return res.status(200).json({
            success: true,
            data: trackingInfo
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const createNewReturnRequest = async (req, res) => {
    try {
        const customerId = req.headers['user-id'] || 'CUST-default';
        const { shipmentId, reason, items } = req.body;

        const newReturn = await returnService.createReturn(customerId, { shipmentId, reason, items });

        return res.status(201).json({
            success: true,
            message: "Return request submitted successfully!",
            data: newReturn
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const getAllReturns = async (req, res) => {
    try {
        const allData = await returnService.fetchAllData();
        return res.status(200).json({
            success: true,
            totalEntries: allData.requests.length,
            entries: allData.requests
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const reviewReturnRequest = async (req, res) => {
    try {
        const { returnId } = req.params;
        const { decision, sellerId } = req.body; 

        if (!decision || !['Approved', 'Rejected'].includes(decision)) {
            return res.status(400).json({
                success: false,
                message: "Invalid decision value. Must be 'Approved' or 'Rejected'."
            });
        }

        const updatedRequest = await returnService.reviewReturn(returnId, decision, sellerId || 'SELLER-01');

        return res.status(200).json({
            success: true,
            message: `Return request status updated to ${decision}!`,
            data: updatedRequest
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};