import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Requested-With",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { table, operation, payload } = await req.json();

    if (!table || !operation) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: table and operation" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let query = supabase.from(table);
    let result;

    switch (operation) {
      case "select":
        query = query.select(payload?.select || "*");
        if (payload?.eq) {
          for (const [key, value] of Object.entries(payload.eq)) {
            query = query.eq(key, value);
          }
        }
        if (payload?.neq) {
          for (const [key, value] of Object.entries(payload.neq)) {
            query = query.neq(key, value);
          }
        }
        if (payload?.gt) {
          for (const [key, value] of Object.entries(payload.gt)) {
            query = query.gt(key, value);
          }
        }
        if (payload?.gte) {
          for (const [key, value] of Object.entries(payload.gte)) {
            query = query.gte(key, value);
          }
        }
        if (payload?.lt) {
          for (const [key, value] of Object.entries(payload.lt)) {
            query = query.lt(key, value);
          }
        }
        if (payload?.lte) {
          for (const [key, value] of Object.entries(payload.lte)) {
            query = query.lte(key, value);
          }
        }
        if (payload?.like) {
          for (const [key, value] of Object.entries(payload.like)) {
            query = query.like(key, value);
          }
        }
        if (payload?.ilike) {
          for (const [key, value] of Object.entries(payload.ilike)) {
            query = query.ilike(key, value);
          }
        }
        if (payload?.is) {
          for (const [key, value] of Object.entries(payload.is)) {
            query = query.is(key, value);
          }
        }
        if (payload?.in) {
          for (const [key, value] of Object.entries(payload.in)) {
            query = query.in(key, value);
          }
        }
        if (payload?.order) {
          query = query.order(payload.order.column, { ascending: payload.order.ascending ?? true });
        }
        if (payload?.limit) {
          query = query.limit(payload.limit);
        }
        if (payload?.single) {
          result = await query.maybeSingle();
        } else {
          result = await query;
        }
        break;

      case "insert":
        result = await query.insert(payload?.data).select();
        break;

      case "update":
        query = query.update(payload?.data);
        if (payload?.eq) {
          for (const [key, value] of Object.entries(payload.eq)) {
            query = query.eq(key, value);
          }
        }
        result = await query.select();
        break;

      case "delete":
        if (payload?.eq) {
          for (const [key, value] of Object.entries(payload.eq)) {
            query = query.eq(key, value);
          }
        }
        result = await query;
        break;

      case "upsert":
        result = await query.upsert(payload?.data).select();
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported operation: ${operation}` }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
    }

    if (result.error) {
      console.error("Supabase error:", result.error);
      return new Response(
        JSON.stringify({ error: result.error.message, details: result.error }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: result.data, error: null }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
