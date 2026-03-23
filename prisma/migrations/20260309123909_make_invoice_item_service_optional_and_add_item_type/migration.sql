-- CreateEnum
CREATE TYPE "InvoiceItemType" AS ENUM ('ROOM_FEE', 'DEPOSIT', 'SERVICE', 'OTHER');

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_serviceId_fkey";

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" "InvoiceItemType" NOT NULL DEFAULT 'SERVICE',
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
