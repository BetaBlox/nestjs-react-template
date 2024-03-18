import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { routeWithParams } from '@repo/utils';
import { MODEL, MODEL_RECORD } from '@/common/routes';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { AdminModelPayload } from '@repo/types';
import { getDashboard } from '@repo/admin-config';
import { ModelApi } from '@/api/ModelApi';
import { Button } from '@/components/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/Card';

export default function HomePage() {
  const modelsQuery = useQuery({
    queryKey: ['models'],
    queryFn: async () => ModelApi.findMany().then(({ data }) => data),
  });

  if (modelsQuery.isPending) return 'Loading...';
  if (modelsQuery.isError) return 'Error loading data';

  const data = modelsQuery.data as AdminModelPayload[];

  return (
    <div>
      <PageHeader heading="Home" />

      <div className="grid-col-2 mx-auto my-5 grid gap-4 md:grid-cols-3">
        {data.map(({ modelName, count, recentRecords }) => {
          const dashboard = getDashboard(modelName);

          return (
            <Card key={dashboard.name}>
              <CardHeader>
                <CardTitle>
                  <Link
                    to={routeWithParams(MODEL, {
                      modelName,
                    })}
                  >
                    {dashboard.name}
                  </Link>
                </CardTitle>
                <CardDescription>{count} records</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="mb-1 text-xs font-bold uppercase">
                  Recent Records
                </h3>
                <div>
                  {(recentRecords || []).map((record) => (
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
              </CardContent>
              <CardFooter>
                <div className="flex w-full flex-row justify-end">
                  <Link to={routeWithParams(MODEL, { modelName })}>
                    <Button size={'sm'}>
                      See All <ArrowRightCircleIcon className="ml-2 h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
