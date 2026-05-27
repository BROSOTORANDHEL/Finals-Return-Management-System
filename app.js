import express from 'express';
import dotenv from 'dotenv';
import returnRoutes from './router/returnRoutes.js';


dotenv.config();

const app = express();


app.use(express.json());


app.use('/api/returns', returnRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Return Management System server is running on port ${PORT}`);
});

export default app;