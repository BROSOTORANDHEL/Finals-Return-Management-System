const returnRequestDB = [];
const returnStatusDB = [];

export const createReturnRequest = async (req, res) => {
  try {
    const { shipmentId, reason, items } = req.body;

    if (!shipmentId || !reason || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide shipmentId, reason, and an items array."
      });
    }

    const nextIdNumber = returnRequestDB.length + 1;
    const returnRequestId = `RET-${nextIdNumber}`;

    const newRequest = {
      returnRequestId,
      customerId: req.headers['user-id'] || 'UNKNOWN_CUSTOMER',
      shipmentId,
      reason,
      items,
      decisionStatus: "Pending",
      createdAt: new Date().toISOString()
    };

    returnRequestDB.push(newRequest);

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      data: newRequest
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating return request.",
      error: error.message
    });
  }
};

export const reviewReturnRequest = async (req, res) => {
  try {
    const { returnRequestId } = req.params;
    const { decision } = req.body;

    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision value. Must be either 'Approved' or 'Rejected'."
      });
    }

    const requestIndex = returnRequestDB.findIndex(r => r.returnRequestId === returnRequestId);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `No return request found with ID: ${returnRequestId}`
      });
    }

    returnRequestDB[requestIndex].decisionStatus = decision;

    console.log(`[Notification Hook Triggered] sending update to Notification Group for ${returnRequestId}. Status changed to: ${decision}`);

    return res.status(200).json({
      success: true,
      message: `Return request status updated to ${decision}.`,
      data: returnRequestDB[requestIndex]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while reviewing return request.",
      error: error.message
    });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const { returnRequestId } = req.params;
    const { status, location } = req.body;

    if (!status || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing tracking fields. Please provide both status and location values."
      });
    }

    const requestExists = returnRequestDB.some(r => r.returnRequestId === returnRequestId);
    if (!requestExists) {
      return res.status(404).json({
        success: false,
        message: `Cannot update tracking. No return request record found for ID: ${returnRequestId}`
      });
    }

    const newTrackingUpdate = {
      trackingId: `TRK-${returnStatusDB.length + 1}`,
      returnRequestId,
      status,
      location,
      updatedAt: new Date().toISOString(),
      updatedBy: req.headers['user-id'] || 'UNKNOWN_SELLER'
    };

    returnStatusDB.push(newTrackingUpdate);

    return res.status(200).json({
      success: true,
      message: "Shipment logistics tracking record updated successfully.",
      data: newTrackingUpdate
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating tracking record.",
      error: error.message
    });
  }
};

export const trackReturnProgress = async (req, res) => {
  try {
    const { returnRequestId } = req.params;

    const baseRequest = returnRequestDB.find(r => r.returnRequestId === returnRequestId);

    if (!baseRequest) {
      return res.status(404).json({
        success: false,
        message: "No record found for that tracking parameters."
      });
    }

    const historyLog = returnStatusDB.filter(t => t.returnRequestId === returnRequestId);

    return res.status(200).json({
      success: true,
      data: {
        returnRequestId: baseRequest.returnRequestId,
        shipmentId: baseRequest.shipmentId,
        currentDecisionStatus: baseRequest.decisionStatus,
        reason: baseRequest.reason,
        items: baseRequest.items,
        trackingHistory: historyLog 
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while compiling tracking report.",
      error: error.message
    });
  }
};

export const getAllDataDump = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      requests: returnRequestDB,
      tracking: returnStatusDB
    }
  });
};