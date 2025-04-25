import { handleServerResponse, ResponseData } from "@dobuki/firebase-store";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (or specify e.g., "http://localhost:3000")
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
};

interface Env {
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      const responseData: ResponseData = await handleServerResponse(request.url, {
        privateKey: env.FIREBASE_PRIVATE_KEY,
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      });
      return new Response(JSON.stringify(responseData), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.error(error);
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
