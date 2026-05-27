import axios from 'axios';

export const mockAuthCheck = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = {
            id: req.headers['user-id'] || 'USR-99',
            role: req.headers['user-role'] || 'Customer'
        };
        return next();
    }

    const token = authHeader.split(' ')[1];
    const authGroupUrl = process.env.AUTH_GROUP_URL || 'https://authentication-system-final.onrender.com/users';

    try {
        const verifyResponse = await axios.get(`${authGroupUrl}/rider/delivery`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (verifyResponse.data.success) {
            req.user = verifyResponse.data.user;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Access denied: Rider permissions required ❌"
        });

    } catch (error) {
        if (error.response && error.response.status === 403) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Unauthorized account ❌"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Session expired or invalid token."
        });
    }
};

export const triggerExternalNotification = async (eventType, payload) => {
    const notificationGroupUrl = process.env.NOTIFICATION_GROUP_URL || 'https://notification-system-final.onrender.com';

    if (!process.env.NOTIFICATION_GROUP_URL) {
        console.log(`[Integration Layer] Triggering external Notification System for event: ${eventType}`);
        console.log(`[Notification Data Sent to Mock]:`, {
            recipientEmail: payload.customerEmail || "customer@example.com",
            recipientName: payload.customerName || "Valued Customer",
            subject: `Return Update: Order #${payload.returnId}`,
            body: `Your return request status has changed to: ${payload.newStatus}.`,
            sourceSystem: "Return Management System"
        });
        return true;
    }

    try {
        await axios.post(`${notificationGroupUrl}/api/notifications`, {
            recipientEmail: payload.customerEmail || "customer@example.com", 
            recipientName: payload.customerName || "Valued Customer",
            subject: `Return Update: Order #${payload.returnId}`,
            body: `Your return request status has changed to: ${payload.newStatus}.`,
            sourceSystem: "Return Management System"
        });
        return true;
    } catch (error) {
        console.error("External notification dispatch failed:", error.message);
        return false;
    }
};