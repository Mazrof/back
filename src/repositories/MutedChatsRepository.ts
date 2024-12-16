import prisma from "../prisma/client";
import { MuteDuration } from "@prisma/client";
export const getPersonalChatUsers = async (participantId: number) => {
    const users=await prisma.participants.findUnique({
        where:{
            id:participantId
        },
        include:{
            personalChat:{
                include:{
                    users1:{
                        select:{
                            id:true,
                            fcmtokens:true
                        }
                    },
                    users2:{
                        select:{
                            id:true,
                            fcmtokens:true
                        }
                    }
                }
            }
        }
    });

    const usersWithFCM=[users.personalChat.users1,users.personalChat.users2].filter((user)=>user.fcmtokens.length>0);
    return usersWithFCM || [];
}

export const getGroupUsers=async (participantId:number)=>{
    const users=await prisma.participants.findUnique({
        where:{
            id:participantId
        },
        include:{
            communities:{
                include:{
                    groups:{
                        include:{
                            groupMemberships:{
                                include:{
                                    users:{
                                        select:{
                                            id:true,
                                            fcmtokens:true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    const usersWithFCM=users.communities.groups.groupMemberships.map((user)=>user.users).filter((user)=>user.fcmtokens.length>0);

    return usersWithFCM || [];
}

export const getChannelUsers=async (participantId:number)=>{
    const users=await prisma.participants.findUnique({
        where:{
            id:participantId
        },
        include:{
            communities:{
                include:{
                    channels:{
                        include:{
                            channelSubscriptions:{
                                include:{
                                    users:{
                                        select:{
                                            id:true,
                                            fcmtokens:true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    const usersWithFCM=users.communities.channels?.channelSubscriptions.map((user)=>user.users).filter((user)=>user.fcmtokens.length>0);
    
    return usersWithFCM || [];
}


export const getUserMutedParticipants = async(participantId:number)=>{
    const mutedParticipants= await prisma.mutedParticipants.findMany({
        where:{
            participantId
        },
        include:{
            users:{
                select:{
                    id:true,
                    fcmtokens:true,
                }
            }
        }
    });
    const nonExpiredMutedParticipants=mutedParticipants.filter((participant)=>new Date(participant.expiryDate)>new Date());
    removeExpiredMutedParticipants(nonExpiredMutedParticipants.map((participant)=>({participantId:participant.participantId,userId:participant.userId})));
    return nonExpiredMutedParticipants.map((participant)=>participant.users) || [];

}

export const getParticipantType=async (participantId:number)=>{
    return await prisma.participants.findUnique({
        where:{
            id:participantId
        },
        select:{
            type:true
        }
    });
}

const MuteDurations={
    [MuteDuration.oneHour]:"1h",
    [MuteDuration.oneDay]:"1d",
    [MuteDuration.oneWeek]:"1w",
    [MuteDuration.oneMonth]:"1M",
    [MuteDuration.forever]:"forever"

}
export const addMutedParticipant=async (participantId:number,userId:number,duration:MuteDuration)=>{
    const expiryDate=new Date()+MuteDurations[duration];
    return await prisma.mutedParticipants.create({
        data:{
            userId,
            participantId,
            expiryDate
        }
    }); 
}

export const removeMutedParticipant=async (participantId:number,userId:number)=>{
    return await prisma.mutedParticipants.deleteMany({
        where:{
            userId,
            participantId
        }
    });
}

export const removeExpiredMutedParticipants=async (participantsIds:{participantId:number,userId:number}[])=>{
    return await prisma.mutedParticipants.deleteMany(
        {
            where:{
                OR: participantsIds.map(({ participantId, userId }) => ({
                    participantId,
                    userId
                }))
            }
        }
    );
}
export const updateMutedParticipant=async (participantId:number,userId:number,duration:MuteDuration)=>{
    const expiryDate=new Date()+MuteDurations[duration];
    return await prisma.mutedParticipants.updateMany({
        where:{
            userId,
            participantId
        },
        data:{
            expiryDate
        }
    });
}