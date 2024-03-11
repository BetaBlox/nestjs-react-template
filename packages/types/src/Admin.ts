export type SelectOption = { label: string; value: string };

export const enum AdminFieldType {
  STRING = 'string',
  TEXT = 'text',
  PASSWORD = 'password',
  BOOLEAN = 'boolean',
  INTEGER = 'int',
  SELECT = 'select',
  JSON = 'json',
  RELATIONSHIP_HAS_ONE = 'relationship_has_one',
  DATETIME = 'datetime',
}

export type AdminAttributeType = {
  name: string;
  type: AdminFieldType;
  options?: SelectOption[];
  modelName?: string;
  sourceKey?: string;
  defaultValue?: any;
};

export interface AdminModelPayload {
  prismaModel: any;
  modelName: string;
  count: number;
  // TODO: probably shouldn't mutate the raw data. Maybe a separate displayName lookup hash?
  recentRecords: any[] & {
    displayName: string;
  };
}

export interface AdminRecordsPayload {
  prismaModel: any;
  modelName: string;
  paginatedResult: PaginatedResult<any>;
}

export interface AdminRecordPayload {
  prismaModel: any;
  modelName: string;
  record: any;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};
export type PaginateFunction = <T, K>(
  model: any,
  args?: K,
  options?: PaginateOptions,
) => Promise<PaginatedResult<T>>;
