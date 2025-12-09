export type PaginatedDatabaseResponse<T> = {
  data: T[];
  meta: Meta;
};

export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Link = {
  self: string;
  first: string;
  last: string;
  next?: string;
  prev?: string;
};
