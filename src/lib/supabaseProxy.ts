const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/supabase-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface ProxyRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  payload?: {
    select?: string;
    data?: any;
    eq?: Record<string, any>;
    order?: {
      column: string;
      ascending?: boolean;
    };
    limit?: number;
    single?: boolean;
  };
}

interface ProxyResponse<T = any> {
  data: T;
  error: any;
}

export async function proxyRequest<T = any>(request: ProxyRequest): Promise<ProxyResponse<T>> {
  try {
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
        data: null as any,
        error: errorData.error || 'Request failed',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Proxy request failed:', error);
    return {
      data: null as any,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const supabaseProxy = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      order: (column: string, options?: { ascending?: boolean }) => ({
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'select',
            payload: {
              select: columns,
              order: {
                column,
                ascending: options?.ascending ?? true,
              },
            },
          });
        },
      }),
      eq: (column: string, value: any) => ({
        maybeSingle: async () => {
          return proxyRequest({
            table,
            operation: 'select',
            payload: {
              select: columns,
              eq: { [column]: value },
              single: true,
            },
          });
        },
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'select',
            payload: {
              select: columns,
              eq: { [column]: value },
            },
          });
        },
      }),
      limit: (count: number) => ({
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'select',
            payload: {
              select: columns,
              limit: count,
            },
          });
        },
      }),
      execute: async () => {
        return proxyRequest({
          table,
          operation: 'select',
          payload: {
            select: columns,
          },
        });
      },
    }),
    insert: (data: any) => ({
      select: () => ({
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'insert',
            payload: { data },
          });
        },
      }),
      execute: async () => {
        return proxyRequest({
          table,
          operation: 'insert',
          payload: { data },
        });
      },
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          execute: async () => {
            return proxyRequest({
              table,
              operation: 'update',
              payload: {
                data,
                eq: { [column]: value },
              },
            });
          },
        }),
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'update',
            payload: {
              data,
              eq: { [column]: value },
            },
          });
        },
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'delete',
            payload: {
              eq: { [column]: value },
            },
          });
        },
      }),
    }),
    upsert: (data: any) => ({
      select: () => ({
        execute: async () => {
          return proxyRequest({
            table,
            operation: 'upsert',
            payload: { data },
          });
        },
      }),
      execute: async () => {
        return proxyRequest({
          table,
          operation: 'upsert',
          payload: { data },
        });
      },
    }),
  }),
};
