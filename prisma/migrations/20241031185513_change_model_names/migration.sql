-- CreateEnum
CREATE TYPE "channel_role" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "privacy" AS ENUM ('everyone', 'contacts', 'nobody');

-- CreateEnum
CREATE TYPE "social" AS ENUM ('github', 'facebook', 'google');

-- CreateTable
CREATE TABLE "admingroupfilters" (
    "admin_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "admingroupfilters_pkey" PRIMARY KEY ("admin_id","group_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "password_changed_at" TIMESTAMP(6),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bannedusers" (
    "admin_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "bannedusers_pkey" PRIMARY KEY ("admin_id","user_id")
);

-- CreateTable
CREATE TABLE "callreceivers" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER,
    "personal_chat_id" INTEGER,

    CONSTRAINT "callreceivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER,
    "can_add_comments" BOOLEAN DEFAULT true,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channelsubscriptions" (
    "user_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "has_download_permissions" BOOLEAN DEFAULT false,
    "current_role" "channel_role",

    CONSTRAINT "channelsubscriptions_pkey" PRIMARY KEY ("user_id","channel_id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "privacy" BOOLEAN DEFAULT true,
    "creator_id" INTEGER,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupmemberships" (
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "role" VARCHAR(50),
    "has_download_permissions" BOOLEAN DEFAULT false,
    "has_message_permissions" BOOLEAN DEFAULT false,
    "add_to_group_permission" BOOLEAN DEFAULT false,

    CONSTRAINT "groupmemberships_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER,
    "group_size" INTEGER,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "media_type" VARCHAR(50),
    "media_url" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messagementions" (
    "user_id" INTEGER NOT NULL,
    "message_id" INTEGER NOT NULL,

    CONSTRAINT "messagementions_pkey" PRIMARY KEY ("user_id","message_id")
);

-- CreateTable
CREATE TABLE "messagereadreceipts" (
    "user_id" INTEGER NOT NULL,
    "message_id" INTEGER NOT NULL,
    "delivered_at" TIMESTAMP(6),
    "read_at" TIMESTAMP(6),
    "participant_id" INTEGER,

    CONSTRAINT "messagereadreceipts_pkey" PRIMARY KEY ("user_id","message_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(6),
    "is_announcement" BOOLEAN DEFAULT false,
    "is_forward" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "url" TEXT,
    "attachment" TEXT,
    "sender_id" INTEGER NOT NULL,
    "reply_to" INTEGER,
    "participant_id" INTEGER NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutedparticipants" (
    "user_id" INTEGER NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "duration" interval,

    CONSTRAINT "mutedparticipants_pkey" PRIMARY KEY ("user_id","participant_id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER,
    "personal_chat_id" INTEGER,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalchat" (
    "id" SERIAL NOT NULL,
    "user1id" INTEGER NOT NULL,
    "user2id" INTEGER NOT NULL,

    CONSTRAINT "personalchat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "content" TEXT,
    "status" BOOLEAN DEFAULT true,
    "expiry_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_views" (
    "user_id" INTEGER NOT NULL,
    "story_id" INTEGER NOT NULL,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("user_id","story_id")
);

-- CreateTable
CREATE TABLE "storymedia" (
    "story_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,

    CONSTRAINT "storymedia_pkey" PRIMARY KEY ("story_id","media_id")
);

-- CreateTable
CREATE TABLE "user_blacklist" (
    "blocker_id" INTEGER NOT NULL,
    "blocked_id" INTEGER NOT NULL,

    CONSTRAINT "user_blacklist_pkey" PRIMARY KEY ("blocker_id","blocked_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "password_changed_at" TIMESTAMP(6),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "photo" TEXT,
    "bio" TEXT,
    "screen_name" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "last_seen" TIMESTAMP(6),
    "active_now" BOOLEAN DEFAULT false,
    "provider_type" "social",
    "provider_id" INTEGER,
    "auto_download_size_limit" INTEGER,
    "max_limit_file_size" INTEGER,
    "profile_pic_visibility" "privacy" DEFAULT 'everyone',
    "story_visibility" "privacy" DEFAULT 'everyone',
    "read_receipts_enabled" "privacy" DEFAULT 'everyone',
    "last_seen_visibility" BOOLEAN DEFAULT true,
    "group_add_permission" BOOLEAN DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_calls" (
    "id" SERIAL NOT NULL,
    "start_at" TIMESTAMP(6),
    "end_at" TIMESTAMP(6),
    "number_of_participants" INTEGER,
    "status" BOOLEAN DEFAULT true,
    "creator_id" INTEGER,
    "callreceiver_id" INTEGER,

    CONSTRAINT "voice_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "admingroupfilters" ADD CONSTRAINT "admingroupfilters_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admingroupfilters" ADD CONSTRAINT "admingroupfilters_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bannedusers" ADD CONSTRAINT "bannedusers_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bannedusers" ADD CONSTRAINT "bannedusers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "callreceivers" ADD CONSTRAINT "callreceivers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "callreceivers" ADD CONSTRAINT "callreceivers_personal_chat_id_fkey" FOREIGN KEY ("personal_chat_id") REFERENCES "personalchat"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channelsubscriptions" ADD CONSTRAINT "channelsubscriptions_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "channelsubscriptions" ADD CONSTRAINT "channelsubscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "groupmemberships" ADD CONSTRAINT "groupmemberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "groupmemberships" ADD CONSTRAINT "groupmemberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messagementions" ADD CONSTRAINT "messagementions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messagementions" ADD CONSTRAINT "messagementions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messagereadreceipts" ADD CONSTRAINT "messagereadreceipts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messagereadreceipts" ADD CONSTRAINT "messagereadreceipts_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messagereadreceipts" ADD CONSTRAINT "messagereadreceipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_fkey" FOREIGN KEY ("reply_to") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mutedparticipants" ADD CONSTRAINT "mutedparticipants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mutedparticipants" ADD CONSTRAINT "mutedparticipants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_personal_chat_id_fkey" FOREIGN KEY ("personal_chat_id") REFERENCES "personalchat"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "personalchat" ADD CONSTRAINT "personalchat_user1id_fkey" FOREIGN KEY ("user1id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "personalchat" ADD CONSTRAINT "personalchat_user2id_fkey" FOREIGN KEY ("user2id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "storymedia" ADD CONSTRAINT "storymedia_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "storymedia" ADD CONSTRAINT "storymedia_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_blacklist" ADD CONSTRAINT "user_blacklist_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_blacklist" ADD CONSTRAINT "user_blacklist_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voice_calls" ADD CONSTRAINT "voice_calls_callreceiver_id_fkey" FOREIGN KEY ("callreceiver_id") REFERENCES "callreceivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voice_calls" ADD CONSTRAINT "voice_calls_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
