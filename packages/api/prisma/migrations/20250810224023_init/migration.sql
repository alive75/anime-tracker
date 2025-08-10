-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS');

-- CreateEnum
CREATE TYPE "UserAnimeStatus" AS ENUM ('WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animes" (
    "id" SERIAL NOT NULL,
    "external_api_id" INTEGER NOT NULL,
    "titles" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "total_episodes" INTEGER NOT NULL,
    "status" "ReleaseStatus" NOT NULL,
    "image_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_anime_list" (
    "userId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "status" "UserAnimeStatus" NOT NULL,
    "watched_episodes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_anime_list_pkey" PRIMARY KEY ("userId","animeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "animes_external_api_id_key" ON "animes"("external_api_id");

-- AddForeignKey
ALTER TABLE "user_anime_list" ADD CONSTRAINT "user_anime_list_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_anime_list" ADD CONSTRAINT "user_anime_list_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
