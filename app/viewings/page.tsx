import { prisma } from "@/lib/prisma";
import Button from "@/app/components/Button";
import { PlusIcon, HomeIcon, ExternalLinkIcon } from "@/app/components/icons";
import RefreshButton from "./components/RefreshButton";


export default async function ViewingsPage() {
  const viewings = await prisma.viewing.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      agentStakeholder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Viewings
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              View all viewing records
            </p>
          </div>
          <div className="flex gap-4">
            <RefreshButton />
            <Button
              href="/viewings/new"
              icon={<PlusIcon className="h-5 w-5" />}
              tooltip="Create a new viewing"
            />
            <Button
              href="/"
              variant="secondary"
              icon={<HomeIcon className="h-5 w-5" />}
              tooltip="Return to home page"
            />
          </div>
        </div>

        {viewings.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              No viewings found.
            </p>
            <Button
              href="/viewings/new"
              icon={<PlusIcon className="h-5 w-5" />}
              tooltip="Create your first viewing"
              className="mt-4"
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Id
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Address
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Ad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Bedrooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Elevator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                      Agent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                  {viewings.map((viewing) => (
                    <tr
                      key={viewing.id}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {viewing.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                        {viewing.linkAddress ? (
                          <a
                            href={viewing.linkAddress}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {viewing.address}
                          </a>
                        ) : (
                          viewing.address
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                        {viewing.linkAd ? (
                          <a
                            href={viewing.linkAd}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center text-zinc-600 hover:text-blue-600 transition-colors dark:text-zinc-400 dark:hover:text-blue-400"
                            title="Open ad link"
                          >
                            <ExternalLinkIcon className="h-5 w-5" />
                          </a>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-700">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {viewing.size ? `${viewing.size.toNumber()} m²` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {viewing.price ? `€${viewing.price.toNumber().toLocaleString()}` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {viewing.bedrooms ? viewing.bedrooms.toNumber() : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {viewing.floor ? viewing.floor.toNumber() : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {viewing.isElevator ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Yes
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {viewing.agentStakeholder?.name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Showing {viewings.length} viewing
          {viewings.length !== 1 ? "s" : ""}
        </div>
      </main>
    </div>
  );
}
