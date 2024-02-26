import { createUrl, editUrl, modelDisplayName, showUrl } from '@/config/admin';
import { DMMF } from 'database';
import { Link, useParams } from 'react-router-dom';
import { captilalize, routeWithParams } from 'utils';
import {
  AdminAttributeType,
  renderFieldInCollectionView,
} from '../../../../admin-api/src/config/admin';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import {
  MODEL_RECORD,
  MODEL_RECORD_CREATE,
  MODEL_RECORD_EDIT,
} from '@/common/routes';

export default function ModelPage() {
  const { modelName } = useParams();

  const modelQuery = useQuery({
    queryKey: [`model/${modelName}`],
    queryFn: async () => {
      const url = routeWithParams('/api/models/:modelName', { modelName });
      const res = await fetch(url, {
        method: 'GET',
      });
      return res.json();
    },
  });

  if (modelQuery.isPending) return 'Loading...';
  if (modelQuery.isError || !modelName) return 'Error loading data';

  const data = modelQuery.data as {
    prismaModelConfig: DMMF.Model;
    attributeTypes: AdminAttributeType[];
    collectionAttributes: string[];
    showAttributes: string[];
    formAttributes: string[];
    count: number;
    // Ignoring for now because we don't have a type for this API payload
    records: any[]; // eslint-disable-line
  };

  const {
    // attributeTypes,
    collectionAttributes,
    // showAttributes,
    // formAttributes,
    records,
    count,
  } = data;

  const title = `${modelDisplayName(modelName)} (${count})`;

  return (
    <div>
      <PageHeader
        heading={title}
        breadcrumbs={[
          { href: '#', text: modelDisplayName(modelName), current: true },
        ]}
        actions={
          <Link
            to={routeWithParams(MODEL_RECORD_CREATE, {
              modelName,
            })}
            className="rounded bg-green-600 px-3 py-2 font-medium text-white"
          >
            Add New
          </Link>
        }
      />
      <div className="relative overflow-x-auto bg-white shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-50">
          <thead className="bg-gray-100 text-xs text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">
                Id
              </th>
              {collectionAttributes.map((attribute) => (
                <th
                  scope="col"
                  key={attribute}
                  className="whitespace-nowrap px-6 py-3"
                >
                  {captilalize(attribute)}
                </th>
              ))}
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 text-gray-900">{record.id}</td>
                {collectionAttributes.map((attribute) => (
                  <td
                    key={attribute}
                    className="whitespace-nowrap px-6 py-4 text-gray-900"
                  >
                    {renderFieldInCollectionView(record, modelName, attribute)}
                  </td>
                ))}
                <td className="flex flex-row gap-2 px-6 py-4 text-gray-900">
                  <Link
                    to={routeWithParams(MODEL_RECORD, {
                      modelName,
                      id: record.id,
                    })}
                    className="rounded px-3 py-2 font-medium text-slate-500 hover:bg-slate-500 hover:text-white"
                  >
                    Show
                  </Link>
                  <Link
                    to={routeWithParams(MODEL_RECORD_EDIT, {
                      modelName,
                      id: record.id,
                    })}
                    className="rounded px-3 py-2 font-medium text-indigo-500 hover:bg-indigo-500 hover:text-white"
                  >
                    Edit
                  </Link>
                  {/* <DeleteButton modelName={modelName} record={record} /> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
