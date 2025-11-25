import { supabase } from './supabase';

export type {
  Jurisdiction,
  Contact,
  Report,
  JobClassification,
  ImplementationReport,
  AdminCaseNote,
} from './supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/supabase-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function proxyFetch(request: any) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return {
      data: null,
      error: errorData.error || 'Request failed',
    };
  }

  return await response.json();
}

class QueryBuilder {
  private table: string;
  private selectCols: string = '*';
  private filters: any = {};
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private dataPayload: any = null;
  private singleResult: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    this.selectCols = columns;
    this.operation = 'select';
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.dataPayload = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.dataPayload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(data: any) {
    this.operation = 'upsert';
    this.dataPayload = data;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.eq = this.filters.eq || {};
    this.filters.eq[column] = value;
    return this;
  }

  neq(column: string, value: any) {
    this.filters.neq = this.filters.neq || {};
    this.filters.neq[column] = value;
    return this;
  }

  gt(column: string, value: any) {
    this.filters.gt = this.filters.gt || {};
    this.filters.gt[column] = value;
    return this;
  }

  gte(column: string, value: any) {
    this.filters.gte = this.filters.gte || {};
    this.filters.gte[column] = value;
    return this;
  }

  lt(column: string, value: any) {
    this.filters.lt = this.filters.lt || {};
    this.filters.lt[column] = value;
    return this;
  }

  lte(column: string, value: any) {
    this.filters.lte = this.filters.lte || {};
    this.filters.lte[column] = value;
    return this;
  }

  like(column: string, pattern: string) {
    this.filters.like = this.filters.like || {};
    this.filters.like[column] = pattern;
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.ilike = this.filters.ilike || {};
    this.filters.ilike[column] = pattern;
    return this;
  }

  is(column: string, value: any) {
    this.filters.is = this.filters.is || {};
    this.filters.is[column] = value;
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.in = this.filters.in || {};
    this.filters.in[column] = values;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  maybeSingle() {
    this.singleResult = true;
    return this;
  }

  async then(resolve: any, reject: any) {
    try {
      const payload: any = {
        ...this.filters,
      };

      if (this.operation === 'select') {
        payload.select = this.selectCols;
      }

      if (this.dataPayload) {
        payload.data = this.dataPayload;
      }

      if (this.orderBy) {
        payload.order = this.orderBy;
      }

      if (this.limitCount !== null) {
        payload.limit = this.limitCount;
      }

      if (this.singleResult) {
        payload.single = true;
      }

      const result = await proxyFetch({
        table: this.table,
        operation: this.operation,
        payload,
      });

      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
}

export const db = {
  auth: supabase.auth,

  from(table: string) {
    return new QueryBuilder(table);
  },
};
