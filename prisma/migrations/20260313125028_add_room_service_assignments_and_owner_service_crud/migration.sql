-- CreateTable
CREATE TABLE "RoomService" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomService_roomId_serviceId_key" ON "RoomService"("roomId", "serviceId");

-- AddForeignKey
ALTER TABLE "RoomService" ADD CONSTRAINT "RoomService_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomService" ADD CONSTRAINT "RoomService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
