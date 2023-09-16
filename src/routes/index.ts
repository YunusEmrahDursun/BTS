import { Router } from 'express';
import { authMw } from './middleware';
import authRouter from './auth-router';
import userRouter from './user-router';
import gameRouter from './game-router';
import webRouter from './web-router';
import ajaxRouter from './ajax_router';
import apiRouter from './api-router';
// Init
const router = Router();

// Add api routes
/* apiRouter.use('/auth', authRouter);
apiRouter.use('/users', authMw, userRouter);
apiRouter.use('/game',  gameRouter); */
router.use('/api',  apiRouter);
router.use('/web', webRouter);
router.use('/ajax', ajaxRouter);

export default router;
