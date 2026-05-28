const returnRequestDB = [];
const returnStatusDB = [];
let nextReturnId = 1;


export const fetchAllData = async () => {
    const combinedEntries = returnRequestDB.map(request => {
        const history = returnStatusDB.filter(s => s.returnRequestId === request.returnRequestId);
        return {
            ...request,
            trackingHistory: history
        };
    });

    return {
        requests: combinedEntries
    };
};


export const createReturn = async (customerId, details) => {
    const returnRequestId = `RET-${nextReturnId++}`; 
    
    const newRequest = {
        returnRequestId,
        customerId,
        shipmentId: details.shipmentId,
        reason: details.reason,
        items: details.items || [],
        decisionStatus: 'Pending',
        createdAt: new Date()
    };

    returnRequestDB.push(newRequest);
    return newRequest;
};


export const reviewReturn = async (requestId, decision, sellerId) => {
    const request = returnRequestDB.find(r => r.returnRequestId === requestId);
    if (!request) {
        const error = new Error('Return request not found.');
        error.status = 404;
        throw error;
    }

    request.decisionStatus = decision;
    request.reviewedBy = sellerId;
    request.reviewedAt = new Date();


    if (decision === 'Approved') {
        const initialTracking = {
            returnRequestId: requestId,
            status: 'Return Request Approved',
            location: 'Warehouse Hub',
            updatedAt: new Date()
        };
        returnStatusDB.push(initialTracking);
    }

    return request;
};


export const updateReturnStatus = async (requestId, status, location) => {
    const progressRecord = {
        returnRequestId: requestId,
        status,
        location: location || 'Sorting Facility',
        updatedAt: new Date()
    };

    returnStatusDB.push(progressRecord);
    return progressRecord;
};


export const getTrackingInfo = async (requestId) => {
    const parentRequest = returnRequestDB.find(r => r.returnRequestId === requestId);
    const history = returnStatusDB.filter(s => s.returnRequestId === requestId);

    return {
        returnRequestId: requestId,
        shipmentId: parentRequest ? parentRequest.shipmentId : "Ship-Mock101",
        decisionStatus: parentRequest ? parentRequest.decisionStatus : "Approved",
        trackingHistory: history
    };
};