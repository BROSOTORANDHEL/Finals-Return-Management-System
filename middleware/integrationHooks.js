
 
export const mockAuthCheck = (req, res, next) => {

    req.user = {
        id: req.headers['user-id'] || 'USR-99',
        role: req.headers['user-role'] || 'Customer' 
    };
    next();
};


export const triggerExternalNotification = async (eventType, payload) => {
    console.log(`[Integration Layer] Triggering external Notification System for event: ${eventType}`);
    console.log(`[Notification Data]:`, payload);

    return true;
};