import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { useParams } from 'react-router-dom';
import { routeWithParams } from '@repo/utils';
import { MODEL } from '@/common/routes';
import CreateForm from '@/components/CreateForm';
import { getDashboard } from '@repo/admin-config';
import { AdminRecordPayload } from '@repo/types';
import { ModelApi } from '@/api/ModelApi';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/Breadcrumb';

export default function RecordCreatePage() {
  const { modelName } = useParams();
  const recordQuery = useQuery({
    queryKey: ['models', modelName],
    queryFn: async () => ModelApi.findOne(modelName!).then(({ data }) => data),
  });

  if (recordQuery.isPending) return 'Loading...';
  if (recordQuery.isError || !modelName) return 'Error loading data';

  const data = recordQuery.data as AdminRecordPayload;
  const dashboard = getDashboard(modelName);
  const { attributeTypes, createFormAttributes } = dashboard;
  const { fields } = data;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              to={routeWithParams(MODEL, {
                modelName,
              })}
            >
              {dashboard.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader heading={'Create'} />
      <CreateForm
        modelName={modelName}
        fields={fields}
        attributeTypes={attributeTypes}
        formAttributes={createFormAttributes}
      />
    </div>
  );
}
