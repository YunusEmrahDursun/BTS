import SocketIO from 'socket.io';
import StatusCodes from 'http-status-codes';
import { Router, Request, Response } from 'express';

import gameService from '@services/game-service';
import { ParamMissingError, RoomNotFoundError } from '@shared/errors';


// Chat router
const router = Router();
const { OK } = StatusCodes;

// Paths
export const p = {
    connect: '/connect-socket-room/:socketId',
    emit: '/ready',
    move:"/move"
} as const;



/**
 * Connect to socket room.
 */
router.get(p.connect, (req: Request, res: Response) => {
    const { socketId } = req.params;
    // Check params
    if (!socketId) {
        throw new ParamMissingError();
    }
    // Get room
    const io: SocketIO.Server = req.app.get('socketio');
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
        throw new RoomNotFoundError();
    }
    // Connect
    gameService.connectSocketToRm(socket);
    // Return
    return res.status(OK).end();
});


/**
 * Send a chat message.
 */
router.post(p.emit,async (req: Request, res: Response) => {
    const { name, socketId } = req.body;
    // Check params
    if (!socketId || !name) {
        throw new ParamMissingError();
    }
    // Get room
    const io: SocketIO.Server = req.app.get('socketio');
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
        throw new RoomNotFoundError();
    }
    const count=await gameService.setReady(socketId,name)
    if(count>=2){
        gameService.start(io.sockets)
    }
    return res.status(OK).send();
});
router.post(p.move,async (req: Request, res: Response) => {
    const { key, socketId } = req.body;
    // Check params
    if (!socketId || !key) {
        throw new ParamMissingError();
    }
    // Get room
    const io: SocketIO.Server = req.app.get('socketio');
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
        throw new RoomNotFoundError();
    }
    const gamer=await gameService.move(socketId,key)
    gameService.sendPosition(socket,gamer)
    return res.status(OK).send();
});

// Export router
export default router;
