import {Server, Socket} from "socket.io";
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Message {
    recieverId: string;
    content: string;
    file:File;
    filename:string;
    fileType:string
}

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain:process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket:process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(fileData: { file:File,filename:string,fileType:string }):Promise<string> {
    //TODO: UNCOMMENT THIS
    // const fileType = file.type.split('/')[0];

    let folderPath = 'uploads/';

    // Organize by file type
    console.log(fileData);
    if (fileData.fileType === 'image') {
        folderPath += 'images/';
    } else if (fileData.fileType === 'video') {
        folderPath += 'videos/';
    } else {
        folderPath += 'documents/';
    }
    const storageRef = ref(storage, `${folderPath}${fileData.filename}`);
    console.log(fileData.file.name);
    await uploadBytes(storageRef, fileData.file)
    return await getDownloadURL(storageRef);
}

class Chat {
    // private f: boolean;
    constructor(private io: Server) {
        this.setUpListeners();
        // this.f = false;
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
            socket.on('message:create',async(message:Message)=> {
                console.log('create message',message)
                await this.handleNewMessage(socket, message);
            } )
            socket.on('edit-message',(message:Message)=> {
                this.handleEditMessage(socket, message);
            })
            socket.on('delete-message',(message:Message)=> {
                this.handleDeleteMessage(socket, message);
            })

        })
    }
    async handleNewMessage(socket:Socket,message:Message) {
        //TODO:Save message in the db
        //add createdAt,updatedAt,add url, derived at ,read at
        console.log(message)
        let url = undefined;
        if(message.file != undefined){
            url = await uploadFile(message);
            console.log(url);
        }
        this.io.to(message.recieverId.toString()).emit('new-message', {...message,url,file:undefined})
        //TODO: DELETE THIS;
        this.io.emit('new-message', {...message,url,file:undefined})
    }
    handleEditMessage(socket:Socket,message:Message) {
        //TODO: edit in db
        this.io.to(message.recieverId.toString()).emit('edited-message', message);
    }
    handleDeleteMessage(socket:Socket,message:Message) {
        //TODO: delete from in db
        this.io.to(message.recieverId.toString()).emit('deleted-message', message)
    }

}
export default (io:Server)=>{
    new Chat(io)
}
