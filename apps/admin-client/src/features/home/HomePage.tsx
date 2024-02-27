import PageHeader from '@/components/PageHeader';
import { modelDisplayName } from '@/config/admin';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { routeWithParams } from '@repo/utils';
import { MODEL, MODEL_RECORD } from '@/common/routes';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { AdminModelPayload } from '@repo/types';

export default function HomePage() {
  const modelsQuery = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch('/api/models', {
        method: 'GET',
      });
      return res.json();
    },
  });

  if (modelsQuery.isPending) return 'Loading...';
  if (modelsQuery.isError) return 'Error loading data';

  const data = modelsQuery.data as AdminModelPayload[];

  return (
    <div>
      <PageHeader heading="Home" />
      <div className="grid-col-2 mx-auto my-5 grid gap-4 md:grid-cols-3">
        {data.map(({ prismaModelConfig, count, records }) => {
          const modelName = prismaModelConfig.name;

          return (
            <div key={prismaModelConfig.name}>
              <div className="h-full rounded bg-white shadow">
                <div className="mb-4 px-6 py-4">
                  <div className="mb-2 text-4xl font-bold">{count}</div>
                  <Link
                    to={routeWithParams(MODEL, {
                      modelName,
                    })}
                  >
                    <h2 className="text-lg">
                      {modelDisplayName(prismaModelConfig.name)}
                    </h2>
                  </Link>
                </div>
                <div className="px-6 py-4">
                  <h3 className="mb-1 text-xs font-bold uppercase">
                    Recent Records
                  </h3>
                  <div className="divide-y">
                    {(records || []).slice(0, 5).map((record) => (
                      <div key={record.id}>
                        <Link
                          to={routeWithParams(MODEL_RECORD, {
                            modelName,
                            id: record.id,
                          })}
                        >
                          <div className="flex flex-row justify-between gap-4 py-1 text-xs text-gray-500 hover:text-gray-800">
                            <p className="truncate">{record.displayName}</p>
                            <span className="whitespace-nowrap underline">
                              See Details
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4">
                  <Link to={routeWithParams(MODEL, { modelName })}>
                    <div className="flex flex-row justify-end">
                      <button className="mt-4 flex flex-row items-center justify-between gap-2 rounded bg-indigo-600 px-2 py-1 text-sm text-white">
                        See All <ArrowRightCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
