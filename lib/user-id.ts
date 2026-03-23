type UserRole = "LANDLORD" | "TENANT" | "ADMIN";

type UserReader = {
  user: {
    findFirst: (args: {
      where: { id: { startsWith: string } };
      orderBy: { id: "desc" };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

function getPrefix(role: UserRole): string {
  if (role === "LANDLORD") {
    return "OWN";
  }

  if (role === "TENANT") {
    return "TEN";
  }

  return "ADM";
}

export async function generateNextUserId(
  reader: UserReader,
  role: UserRole
): Promise<string> {
  const prefix = getPrefix(role);
  const latest = await reader.user.findFirst({
    where: {
      id: {
        startsWith: `${prefix}-`,
      },
    },
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  const latestNumber = latest
    ? Number.parseInt(latest.id.split("-")[1] ?? "0", 10)
    : 0;
  const nextNumber = Number.isNaN(latestNumber) ? 1 : latestNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}
