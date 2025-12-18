import { prisma } from "@/lib/prisma";
import NewViewingClient from "./NewViewingClient";

export default async function NewViewingPage() {
  const stakeholders = await prisma.stakeholder.findMany({
    where: {
      type: 5,
      isDeleted: false,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return <NewViewingClient stakeholders={stakeholders} />;
}

