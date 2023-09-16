import SocketIO from 'socket.io';
import userRepo from '@repos/gamer-repo';

const socketRoomName = 'kanal1';
var gamers:any={}
var socketRoomPlayerCount=0;

export function connectSocketToRm(socket: SocketIO.Socket): void {
    socket.leave(socketRoomName);
    socket.join(socketRoomName);
}

export async function setReady(socketId: string,name:string){
    if( gamers[socketId]==undefined){
        socketRoomPlayerCount++;
        gamers[socketId]={name,left:400,top:400}
    }
    return socketRoomPlayerCount;
}
export function start(sockets: any){
    sockets.to(socketRoomName).emit('start');

}

export function move(socketId: any,key:string){
    switch (key) {
        case "w":
            gamers[socketId].top--;
            break;
        case "a":
            gamers[socketId].left--;
            break;
        case "s":
            gamers[socketId].top++;
            break;
        case "d":
            gamers[socketId].left++;
            break;
        case "x":
            magicMethod(key)
        default:
            break;
    }
    return gamers[socketId]
}
function x() {
    console.log("x çağrıldı")
}


const magicWand: { [K: string]: Function } = {
   x: x,
};

function magicMethod(name: string) {
  if (magicWand[name]) {
    return magicWand[name]();
  }

  throw new Error(`Method '${name}' is not implemented.`);
}   

export function sendPosition(socket: SocketIO.Socket,gamer:any){
    const room = socket.to(socketRoomName);
    room.emit('position',   gamer );
}

export function emitMessage(
    socket: SocketIO.Socket,
    message: string,
    senderName: string,
): void {
    // Send a message to the room
    const room = socket.to(socketRoomName);
    room.emit('emit-msg', {
        timestamp: Date.now(),
        content: message,
        senderName,
    });
}



export default {
    sendPosition,
    move,
    start,
    setReady,
    connectSocketToRm,
    emitMessage
} as const;
