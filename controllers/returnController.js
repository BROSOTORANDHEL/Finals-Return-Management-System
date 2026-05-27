import { triggerExternalNotification } from "../middleware/integrationHooks.js";

export const updateReturnStatus = async (req, res) => {
    const { returnId } = req.params;
    const { status, customerId } = req.body; // e.g., status: "Returned to Hub"
    
    // Grab the user data that your mockAuthCheck automatically injected
    const currentUser = req.user; 

    // CRITICAL SECURITY RULE: Only allow the update if the user is a rider
    if (currentUser.role.toLowerCase() !== 'rider') {
        return res.status(403).json({
            success: false,
            message: `Access denied: Only accounts with the 'rider' role can process returns. Your current role is: ${currentUser.role} ❌`
        });
    }

    try {
        // [YOUR LOCAL SYSTEM DATABASE/BUSINESS LOGIC GOES HERE]
        // Example: const updatedRecord = await returnService.updateInDb(returnId, status);

        // Call your exact notification trigger function from integrationHooks
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