import { DocumentViewId } from 'shirokuma';

export type Doc<F> = {
  meta: Meta;
  fields: F;
};

export type Paginated<F> = {
  totalCount: number;
  hasNextPage: boolean;
  endCursor: string;
  documents: Doc<F>[];
};

export type Meta = {
  viewId: DocumentViewId;
  documentId: string;
  owner: string;
};
