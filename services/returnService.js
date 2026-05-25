const returnRequestDB = [];
const returnStatusDB = [];

export const fetchAllData = async () => {
    return {
        requests: returnRequestDB,
        tracking: returnStatusDB
    };
};

export const createReturn = async (customerId, details) => {
    const returnRequestId = `RET-${Date.now()}`;
    
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
    const requestExists = returnRequestDB.some(r => r.returnRequestId === requestId);
    if (!requestExists) {
        const error = new Error('Associated Return request records do not exist.');
        error.status = 404;
        throw error;
    }

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
    if (!parentRequest) {
        const error = new Error('No record found for that tracking parameters.');
        error.status = 404;
        throw error;
    }

    const history = returnStatusDB.filter(s => s.returnRequestId === requestId);

    return {
        returnRequestId: parentRequest.returnRequestId,
        shipmentId: parentRequest.shipmentId,
        decisionStatus: parentRequest.decisionStatus,
        trackingHistory: history
    };
};