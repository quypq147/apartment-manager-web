import prisma from "@/lib/prisma"

type ServicesReader = {
    service: {
        findFirst: (args: {
            where: { id: { startsWith: string } };
            orderBy: { id: "desc" };
            select: { id: true };
        }) => Promise<{ id: string } | null>;
    };
};

const SERVICE_PREFIX = "svc_";

export async function generateNextServiceId(reader: ServicesReader = prisma): Promise<string> {
    const lastService = await reader.service.findFirst({
        where: {
            id: {
                startsWith: SERVICE_PREFIX,
            },
        },
        orderBy: {
            id: "desc",
        },
        select: {
            id: true,
        },
    });

    if (!lastService) {
        return `${SERVICE_PREFIX}001`;
    }

    const lastNumberStr = lastService.id.replace(SERVICE_PREFIX, "");
    const lastNumber = Number.parseInt(lastNumberStr, 10);

    if (Number.isNaN(lastNumber)) {
        return `${SERVICE_PREFIX}${Date.now()}`;
    }

    return `${SERVICE_PREFIX}${String(lastNumber + 1).padStart(3, "0")}`;
}