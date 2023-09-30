import { Router } from 'express';
import webRouter from './web-router';
import ajaxRouter from './ajax_router';
import apiRouter from './api-router';
import mobileRouter from './mobile-router'
// Init
const router = Router();

// Add api routes

router.use('/mobile',  mobileRouter);
router.use('/api',  apiRouter);
router.use('/web', webRouter);
router.use('/ajax', ajaxRouter);

export default router;
