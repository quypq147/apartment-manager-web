import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateNextInvoiceId } from "@/lib/invoice-id";

interface CreateInvoiceItemInput {
  serviceId: string;
  quantity: number;
  unitPrice?: number;
  oldIndicator?: number;
  newIndicator?: number;
}

interface CreateInvoiceBody {
  contractId: string;
  month: number;
  year: number;
  title?: string;
  dueDate?: string;
  items: CreateInvoiceItemInput[];
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const monthParam = request.nextUrl.searchParams.get("month");
    const yearParam = request.nextUrl.searchParams.get("year");

    const month = monthParam ? Number(monthParam) : undefined;
    const year = yearParam ? Number(yearParam) : undefined;

    if (monthParam && (!Number.isInteger(month) || month < 1 || month > 12)) {
      return NextResponse.json(
        { success: false, error: "month must be an integer from 1 to 12" },
        { status: 400 }
      );
    }

    if (yearParam && (!Number.isInteger(year) || year < 2000)) {
      return NextResponse.json(
        { success: false, error: "year must be a valid integer" },
        { status: 400 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        contract: {
          room: {
            property: {
              landlordId: userId,
            },
          },
        },
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      include: {
        contract: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            room: {
              include: {
                property: {
                  select: { id: true, name: true, address: true },
                },
              },
            },
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      {
        success: true,
        data: invoices,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/invoices error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id ?? request.headers.get("x-user-id");
    const userRole = currentUser?.role ?? request.headers.get("x-user-role");

    if (!userId || userRole !== "LANDLORD") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateInvoiceBody;
    const { contractId, month, year, title, dueDate, items } = body;

    if (!contractId || !Number.isInteger(month) || !Number.isInteger(year)) {
      return NextResponse.json(
        {
          success: false,
          error: "contractId, month and year are required",
        },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12 || year < 2000) {
      return NextResponse.json(
        { success: false, error: "Invalid month/year" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "items must be an array" },
        { status: 400 }
      );
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid dueDate" },
        { status: 400 }
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({
        where: {
          id: contractId,
          room: {
            property: {
              landlordId: userId,
            },
          },
        },
        include: {
          room: {
            include: {
              property: true,
            },
          },
        },
      });

      if (!contract) {
        throw new Error("CONTRACT_NOT_FOUND");
      }

      if (contract.status !== "ACTIVE") {
        throw new Error("CONTRACT_NOT_ACTIVE");
      }

      const existed = await tx.invoice.findFirst({
        where: {
          contractId,
          month,
          year,
        },
        select: { id: true },
      });

      if (existed) {
        throw new Error("INVOICE_ALREADY_EXISTS");
      }

      const serviceIds = items.map((item) => item.serviceId);
      const services = serviceIds.length
        ? await tx.service.findMany({
            where: {
              id: { in: serviceIds },
              propertyId: contract.room.propertyId,
            },
            select: { id: true, price: true },
          })
        : [];

      const servicePriceMap = new Map(services.map((s) => [s.id, s.price]));

      const invoiceItemsData = items.map((item) => {
        if (!item.serviceId) {
          throw new Error("SERVICE_ID_REQUIRED");
        }

        if (typeof item.quantity !== "number" || Number.isNaN(item.quantity) || item.quantity < 0) {
          throw new Error("INVALID_QUANTITY");
        }

        const basePrice =
          typeof item.unitPrice === "number" && item.unitPrice >= 0
            ? item.unitPrice
            : servicePriceMap.get(item.serviceId);

        if (typeof basePrice !== "number") {
          throw new Error("SERVICE_NOT_FOUND");
        }

        return {
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: basePrice,
          amount: item.quantity * basePrice,
          oldIndicator:
            typeof item.oldIndicator === "number" ? item.oldIndicator : null,
          newIndicator:
            typeof item.newIndicator === "number" ? item.newIndicator : null,
        };
      });

      const servicesTotal = invoiceItemsData.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const totalAmount = contract.roomPrice + servicesTotal;
      const invoiceId = await generateNextInvoiceId(tx);

      return tx.invoice.create({
        data: {
          id: invoiceId,
          contractId,
          title: title?.trim() || `Hóa đơn tháng ${month}/${year}`,
          month,
          year,
          dueDate: parsedDueDate,
          totalAmount,
          status: "UNPAID",
          items: {
            create: invoiceItemsData,
          },
        },
        include: {
          items: {
            include: {
              service: {
                select: { id: true, name: true, unit: true },
              },
            },
          },
          contract: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              room: {
                include: {
                  property: {
                    select: { id: true, name: true, address: true },
                  },
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CONTRACT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Contract not found" },
          { status: 400 }
        );
      }

      if (error.message === "CONTRACT_NOT_ACTIVE") {
        return NextResponse.json(
          { success: false, error: "Cannot create invoice for inactive contract. Please renew the contract first." },
          { status: 400 }
        );
      }

      if (error.message === "INVOICE_ALREADY_EXISTS") {
        return NextResponse.json(
          {
            success: false,
            error: "Invoice for this contract/month/year already exists",
          },
          { status: 400 }
        );
      }

      if (
        [
          "SERVICE_ID_REQUIRED",
          "INVALID_QUANTITY",
          "SERVICE_NOT_FOUND",
        ].includes(error.message)
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid invoice items" },
          { status: 400 }
        );
      }
    }

    console.error("POST /api/invoices error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
