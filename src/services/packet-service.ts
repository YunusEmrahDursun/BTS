
class PacketService {

    readonly  wand: { [K: string]: any } = {
        1: new SystemManager(),
    };
    method(name: string) {
        if (this.wand[name]) {
          return this.wand[name];
        }
        throw new Error(`Method '${name}' is not implemented.`);
    } 
    receiver(arrayBuffer:ArrayBuffer) {
        try {
            let packetType=new Int32Array(arrayBuffer.slice(0,4))[0]            
            let packetArg=new Int32Array(arrayBuffer.slice(4,8))[0] 
            let packetLength=new Int32Array(arrayBuffer.slice(8,12))[0]
            if( packetLength != arrayBuffer.byteLength/4 ) return false; 
            let dataPacket=arrayBuffer.slice(12)
            while(dataPacket.byteLength){
                let dataType=new Int8Array(dataPacket.slice(0,1))[0] 
                let dataLength=new Int32Array(dataPacket.slice(1,5))[0] 
                let data=dataPacket.slice(5,5+dataLength)
                this.method(packetType.toString()).method(dataType,data) 
                dataPacket=dataPacket.slice(0,dataLength+5)
            }
            console.log("bitti")
        } catch (error) {
            console.log(error);
            return false;
        }

    }


}
class SystemManager{
    readonly  wand: { [K: string]: any } = {
        1:  this.position,
    };
    method(name: string,data:ArrayBuffer) {
        if (this.wand[name]) {
          return this.wand[name](data);
        }
        throw new Error(`Method '${name}' is not implemented.`);
    } 
    position(data:ArrayBuffer){
        console.log("position")
    }
}

const packetService=new PacketService()
export default packetService




