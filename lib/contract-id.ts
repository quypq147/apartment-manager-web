import prisma from "@/lib/prisma";

type ContractReader = {
    contract: {
        findFirst: (args: {
            where: { id: { startsWith: string } };
            orderBy: { id: "desc" };
            select: { id: true };
        }) => Promise<{ id: string } | null>;
    };
};

const CONTRACT_PREFIX = "ctr_manual_";

export async function generateNextContractId(reader: ContractReader = prisma): Promise<string> {
    const lastContract = await reader.contract.findFirst({
        where: {
            id: {
                startsWith: CONTRACT_PREFIX,
            },
        },
        orderBy: {
            id: "desc",
        },
        select: {
            id: true,
        },
    });

    if (!lastContract) {
        return `${CONTRACT_PREFIX}001`;
    }

    const lastNumberStr = lastContract.id.replace(CONTRACT_PREFIX, "");
    const lastNumber = Number.parseInt(lastNumberStr, 10);

    if (Number.isNaN(lastNumber)) {
        return `${CONTRACT_PREFIX}${Date.now()}`;
    }

    return `${CONTRACT_PREFIX}${String(lastNumber + 1).padStart(3, "0")}`;
}