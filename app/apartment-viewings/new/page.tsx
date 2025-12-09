import { prisma } from "@/lib/prisma";
import ApartmentViewingForm from "../components/ApartmentViewingForm";
import Button from "@/app/components/Button";
import { ArrowLeftIcon } from "@/app/components/icons";

export default async function NewApartmentViewingPage() {
  const stakeholders = await prisma.stakeholder.findMany({
    where: {
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

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              New Apartment Viewing
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              Stage 1: Remote Analysis - Record basic information from ad links
            </p>
          </div>
          <Button
            href="/apartment-viewings"
            variant="secondary"
            icon={<ArrowLeftIcon className="h-5 w-5" />}
            tooltip="Return to apartment viewings list"
          />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <ApartmentViewingForm stakeholders={stakeholders} />
        </div>
      </main>
    </div>
  );
}

