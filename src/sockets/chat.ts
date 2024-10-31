import {Server, Socket} from "socket.io";
import {deleteFileFromFirebase, uploadFileToFirebase} from "../utility";

interface Message {
    receiverId: string;
    content?: string;
    // file:File;
    // filename:string;
    // fileType:string;
    contextId:string;
    // fileBase64String:string;
    // mimeType:string;
    url:string
}




type UserSocketMap = { [key: number]: Socket };
class Chat {
    private onlineUsers: UserSocketMap[];
    
    constructor(private io: Server) {
        this.setUpListeners();
        this.onlineUsers = [];
    }
    setUpListeners() {
        this.io.on("connection", (socket: Socket) => {
            console.log('User connected');
            //TODO: socket.join(AllhisPersonalChats.id); store them if needed
            //TODO: socket.join(hisGroups.id); store them if needed
            //TODO: socket.join(hisChannels.id); store them if needed
            //TODO: push to the online user array [userId,socket]
            //TODO: update all message to him to be deliveredAt this moment may be in the my-chats route

            // this.onlineUsers.push({123:socket})
            // console.log(this.isOnline(123))
            // console.log(this.getUserSocket(123))

            socket.on('message:sent',async(message:Message)=> {
                console.log('create message',message)
                await this.handleNewMessage(socket, message);
            } )
            socket.on('message:edited',(message:Message)=> {
                this.handleEditMessage(socket, message);
            })
            socket.on('message:deleted',(message:Message)=> {
                this.handleDeleteMessage(socket, message);
            })
            socket.on('message:get-info',(message:Message)=> {
                this.handleMessageInfo(socket, message);
            })
            socket.on('context:opened',(data:any)=> {
                // data.contextId,
                //TODO: update user seen_at date for messsages of this context for the user who make the request
                //query: message join userDelivery on messageID where conext = contextId and recieverUser = requestedUser
                // 1-get all messages that are unseen in this context
                // 2-update seen_at from message delviey table when id  in (array from the previous step)

                // tell other people about that update
                // this.io.to(message.contextId.toString()).emit('message:update-info',message)
            })
        })
    }
    async handleNewMessage(socket:Socket,message:Message) {
        //add createdAt,updatedAt,add url, (derived at ,read at) ==> TABLE
        console.log(message)
        let url = undefined;
        if(message.content  != undefined && message.content.length > 100){
            message.url = await uploadFileToFirebase(message.content)
            message.content = undefined; // to avoid saving it in db
        }
        //TODO: using context id to know the targeted users
        //TODO:Save message in the db
        //TODO:send the messages returned from db
        //TODO:if the message has expire duration use set time out then call the even handler for delete message
        //      settimeout(()=>{this.handledeleteMessage()}),duration)
        this.io.to(message.contextId.toString()).emit('message:receive',message)
        //TODO: DELETE THIS;
        this.io.emit('message:receive', message)
    }
    handleEditMessage(socket:Socket,message:Message) {
        //TODO: edit in db
        this.io.to(message.contextId.toString()).emit('message:edited', message);
    }
    handleDeleteMessage(socket:Socket,message:Message) {
        //TODO: mark this message as deleted, make content null,
        //TODO: delete from firebase
        //TODO: determine who can delete and post files in firebase
        //TODO:this.io.to(message.contextId.toString()).emit('message:edited', message)
        deleteFileFromFirebase('http://example.com/uploads/fileurl')


        this.io.to(message.contextId.toString()).emit('message:deleted', message)
    }
    handleMessageInfo(socket:Socket,message:Message) {
        //
        this.io.to(message.contextId.toString()).emit('message:update-info',message)
    }
    isOnline(userId:number):boolean {
        return this.getUserSocket(userId) !== undefined;
    }
    getUserSocket(userId:number):Socket | undefined {
        const userSocket =  this.onlineUsers.find(userSocket => userId in userSocket);
        if(userSocket)
            return userSocket[userId];
        return undefined;
    }
}
export default (io:Server)=>{
    new Chat(io)
}
