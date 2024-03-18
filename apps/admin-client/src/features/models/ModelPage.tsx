import { Link, useParams } from 'react-router-dom';
import { routeWithParams } from '@repo/utils';
import PageHeader from '@/components/PageHeader';
import { MODEL_RECORD_CREATE } from '@/common/routes';
import { getDashboard } from '@repo/admin-config';
import CollectionTable from './CollectionTable';
import { useDebounceValue } from 'usehooks-ts';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/Breadcrumb';
import { Button } from '@/components/Button';

export default function ModelPage() {
  const { modelName } = useParams();
  const [search, setSearch] = useDebounceValue('', 500);

  if (!modelName) return 'Loading...';

  const dashboard = getDashboard(modelName);

  const actions = (
    <div className="flex flex-row gap-x-4">
      {dashboard.searchAttributes.length > 0 && (
        <input
          type="text"
          id="search"
          name="search"
          className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Search"
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      )}
      {dashboard.isCreatable() && (
        <Button asChild>
          <Link
            to={routeWithParams(MODEL_RECORD_CREATE, {
              modelName,
            })}
          >
            Add New
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{dashboard.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader heading={dashboard.name} actions={actions} />
      <CollectionTable
        dashboard={dashboard}
        modelName={modelName}
        search={search}
      />
    </div>
  );
}
