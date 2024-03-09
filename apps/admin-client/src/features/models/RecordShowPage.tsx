import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { captilalize, routeWithParams } from '@repo/utils';
import PageHeader from '@/components/PageHeader';
import { MODEL, MODEL_RECORD_EDIT } from '@/common/routes';
import { AdminRecordPayload, AdminFieldType } from '@repo/types';
import DeleteButton from './DeleteButton';
import { HttpMethod, customFetch } from '@/common/custom-fetcher';
import ShowViewField from '@/components/ShowViewField';
import { getAttributeType, getDashboard } from '@repo/admin-config';

export default function RecordShowPage() {
  const { modelName, id } = useParams();

  const recordQuery = useQuery({
    queryKey: [`${modelName}/${id}`],
    queryFn: async () => {
      const url = routeWithParams(`/api/records/:modelName/:id`, {
        modelName,
        id,
      });
      const { data } = await customFetch(url, {
        method: HttpMethod.GET,
      });
      return data;
    },
  });

  if (recordQuery.isPending) return 'Loading...';
  if (recordQuery.isError || !modelName) return 'Error loading data';

  const data = recordQuery.data as AdminRecordPayload;
  const dashboard = getDashboard(data.modelName);

  const { record } = data;
  const { showAttributes, getDisplayName } = dashboard;

  return (
    <div>
      <PageHeader
        heading={getDisplayName(record)}
        breadcrumbs={[
          {
            href: routeWithParams(MODEL, {
              modelName,
            }),
            text: dashboard.name,
            current: false,
          },
          {
            href: '#',
            text: getDisplayName(record),
            current: true,
          },
        ]}
        actions={
          <Link
            to={routeWithParams(MODEL_RECORD_EDIT, {
              modelName,
              id: record.id,
            })}
            className="rounded bg-indigo-500 px-3 py-2 font-medium text-white"
          >
            Edit
          </Link>
        }
      />

      <div className="mt-6 border-t border-gray-100 bg-white px-4 shadow-md sm:rounded-lg">
        <dl className="divide-y divide-gray-100">
          {showAttributes.map((attribute) => {
            const attributeType = getAttributeType(modelName, attribute);

            return (
              <div
                key={attributeType.name}
                className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
              >
                <dt className="text-sm font-bold leading-6 text-gray-900">
                  {captilalize(attributeType.name)}
                </dt>
                {attributeType.type === AdminFieldType.JSON ? (
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <pre>
                      <ShowViewField
                        record={record}
                        modelName={modelName}
                        attribute={attribute}
                      />
                    </pre>
                  </dd>
                ) : (
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <ShowViewField
                      record={record}
                      modelName={modelName}
                      attribute={attribute}
                    />
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>

      <div className="mt-6 border-t border-gray-100 bg-white px-4 py-6 shadow-md sm:rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-red-500">Danger Zone</h2>
          <p className="mt-4 text-gray-500">
            This action <strong>CANNOT</strong> be undone. This will permanently
            delete the {modelName} record
          </p>
        </div>

        <DeleteButton payload={data} />
      </div>
    </div>
  );
}
