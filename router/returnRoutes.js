import express from 'express';
import { 
    createReturnRequest, 
    reviewReturnRequest, 
    updateReturnStatus, 
    trackReturnProgress, 
    getAllDataDump 
} from '../controllers/returnController.js';

const router = express.Router();


router.post('/request', createReturnRequest);

router.patch('/review/:returnRequestId', reviewReturnRequest);

router.put('/status/:returnRequestId', updateReturnStatus);


router.get('/track/:returnRequestId', trackReturnProgress);


router.get('/', getAllDataDump);

export default router;