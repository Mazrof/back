import {Server, Socket} from "socket.io";
import {randomInt} from "node:crypto";
interface Message {
    recieverId: string;
    content: string;
}
function getRandomInt(min:number, max:number):number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
class Chat {
    private f: boolean;
    constructor(private io: Server) {
        this.setUpListeners();
        this.f = false;
    }
    setUpListeners() {
        this.io.on("connection", (socket: Socket) => {
            console.log('User connected');
            //TODO: socket.join(user.id); store them if needed
            //TODO: socket.join(hisGroups.id); store them if needed
            //TODO: socket.join(hisChannels.id); store them if needed

            // if(!this.f){
            //     socket.join('1');
            //     this.f = true;
            //     console.log("hi")
            // }else{
            //     socket.join('2');
            //     console.log("bi")
            // }
            socket.on('create-message',(message:Message)=> {
                this.handleNewMessage(socket, message);
            } )
            socket.on('edit-message',(message:Message)=> {
                this.handleEditMessage(socket, message);
            })
            socket.on('delete-message',(message:Message)=> {
                this.handleDeleteMessage(socket, message);
            })

        })
    }
    handleNewMessage(socket:Socket,message:Message) {
        //TODO:Save message in the db
        console.log(message)
        this.io.to(message.recieverId.toString()).emit('new-message', message)
    }
    handleEditMessage(socket:Socket,message:Message) {
        //TODO: edit in db
        this.io.to(message.recieverId.toString()).emit('edited-message', message)
    }
    handleDeleteMessage(socket:Socket,message:Message) {
        //TODO: delete from in db
        this.io.to(message.recieverId.toString()).emit('deleted-message', message)
    }

}
export default (io:Server)=>{
    new Chat(io)
}
