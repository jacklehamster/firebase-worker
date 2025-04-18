import { FireStorage } from "@dobuki/firebase-store";

let storage: FireStorage | null = null;

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (or specify e.g., "http://localhost:3000")
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
};

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") {
      return Response.redirect("https://jacklehamster.github.io/firebase-worker/icon.png");
    }

    try {
      if (!storage) {
        console.log("INITIALIZING Firebase");
        storage = new FireStorage({
          privateKey: env.FIREBASE_PRIVATE_KEY,
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
        });
      }

      // Merge CORS headers with content-type headers
      const responseHeaders = {
        ...corsHeaders,
        "Content-Type": "application/json",
      };

      if (url.pathname === "/") {
        const list = await storage.listKeys();
        return new Response(JSON.stringify(list), {
          headers: responseHeaders,
        });
      }

      const key = url.pathname.substring(1);
      const value = url.searchParams.get("value");
      const del = url.searchParams.get("delete");

      if (del) {
        await storage.setKeyValue(key, undefined);
        const list = await storage.listKeys();
        return new Response(JSON.stringify(list), {
          headers: responseHeaders,
        });
      } else if (value !== null) {
        await storage.setKeyValue(key, { value });
        return new Response(
          JSON.stringify({
            key,
            value,
          }),
          {
            headers: responseHeaders,
          }
        );
      } else {
        console.log("Getting value");
        const val = await storage.getValue(key);
        return new Response(
          JSON.stringify({
            key,
            value: val?.value,
          }),
          {
            headers: responseHeaders,
          }
        );
      }
    } catch (error: any) {
      console.log(error);
      // Include CORS headers in error responses
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
