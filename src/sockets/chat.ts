import {Server, Socket} from "socket.io";

class Chat {
    constructor(private io: Server) {
        this.setUpListeners();
    }
    setUpListeners() {
        this.io.on('connection', (socket:Socket) => {
            console.log('user connected');
        })
    }
}
export default (io:Server)=>{
    new Chat(io)
}