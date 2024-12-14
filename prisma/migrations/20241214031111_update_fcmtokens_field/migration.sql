-- CreateEnum
CREATE TYPE "privacy" AS ENUM ('everyone', 'contacts', 'nobody');

-- CreateEnum
CREATE TYPE "social" AS ENUM ('github', 'facebook', 'google');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('usual', 'pinned', 'drafted');

-- CreateEnum
CREATE TYPE "ParticipiantTypes" AS ENUM ('personalChat', 'community');

-- CreateEnum
CREATE TYPE "community_role" AS ENUM ('admin', 'member');

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
    "community_id" INTEGER NOT NULL,
    "can_add_comments" BOOLEAN NOT NULL DEFAULT false,
    "invitationLink" TEXT NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channelsubscriptions" (
    "user_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "has_download_permissions" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "community_role" "community_role" NOT NULL DEFAULT 'member',

    CONSTRAINT "channelsubscriptions_pkey" PRIMARY KEY ("user_id","channel_id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "privacy" BOOLEAN NOT NULL DEFAULT true,
    "creator_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupmemberships" (
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "has_download_permissions" BOOLEAN NOT NULL DEFAULT false,
    "has_message_permissions" BOOLEAN NOT NULL DEFAULT false,
    "add_to_group_permission" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "community_role" "community_role" NOT NULL DEFAULT 'member',

    CONSTRAINT "groupmemberships_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "community_id" INTEGER NOT NULL,
    "group_size" INTEGER NOT NULL,
    "invitationLink" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
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
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_announcement" BOOLEAN DEFAULT false,
    "is_forward" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "url" TEXT,
    "sender_id" INTEGER NOT NULL,
    "reply_to" INTEGER,
    "participant_id" INTEGER NOT NULL,
    "duration_in_minutes" INTEGER,
    "status" "MessageStatus" NOT NULL DEFAULT 'usual',

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
    "type" "ParticipiantTypes" NOT NULL DEFAULT 'personalChat',

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
    "mediaUrl" TEXT,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_views" (
    "user_id" INTEGER NOT NULL,
    "story_id" INTEGER NOT NULL,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("user_id","story_id")
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
    "provider_id" TEXT,
    "auto_download_size_limit" INTEGER,
    "max_limit_file_size" INTEGER,
    "profile_pic_visibility" "privacy" DEFAULT 'everyone',
    "story_visibility" "privacy" DEFAULT 'everyone',
    "read_receipts_enabled" "privacy" DEFAULT 'everyone',
    "group_add_permission" BOOLEAN DEFAULT true,
    "is_email_verified" BOOLEAN DEFAULT false,
    "is_phone_verified" BOOLEAN DEFAULT false,
    "private_key" TEXT,
    "public_key" TEXT NOT NULL,
    "fcmtokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_seen_visibility" "privacy" DEFAULT 'everyone',

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
CREATE UNIQUE INDEX "admingroupfilters_group_id_key" ON "admingroupfilters"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "channels_community_id_key" ON "channels"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "channels_invitationLink_key" ON "channels"("invitationLink");

-- CreateIndex
CREATE UNIQUE INDEX "groups_community_id_key" ON "groups"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_invitationLink_key" ON "groups"("invitationLink");

-- CreateIndex
CREATE INDEX "messages_participant_id_idx" ON "messages"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_community_id_key" ON "participants"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_personal_chat_id_key" ON "participants"("personal_chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "personalchat_user1id_user2id_key" ON "personalchat"("user1id", "user2id");

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
ALTER TABLE "user_blacklist" ADD CONSTRAINT "user_blacklist_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_blacklist" ADD CONSTRAINT "user_blacklist_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voice_calls" ADD CONSTRAINT "voice_calls_callreceiver_id_fkey" FOREIGN KEY ("callreceiver_id") REFERENCES "callreceivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "voice_calls" ADD CONSTRAINT "voice_calls_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
