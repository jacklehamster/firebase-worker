import { FireStorage } from "@dobuki/firebase-store";

let storage: FireStorage | null = null;

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/favicon.ico') {
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

      if (url.pathname === "/") {
        const list = await storage.listKeys();
        return new Response(JSON.stringify(list), {
          headers: {
            "Content-Type": "application/json"
          },
        });
      }
      const key = url.pathname.substring(1);
      const value = url.searchParams.get("value");
      const del = url.searchParams.get("delete");
      if (del) {
        await storage.setKeyValue(key, undefined);
        const list = await storage.listKeys();
        return new Response(JSON.stringify(list), {
          headers: {
            "Content-Type": "application/json"
          },
        });
      } else if (value !== null) {
        await storage.setKeyValue(key, { value });
        return new Response(JSON.stringify({
          key,
          value,
        }), {
          headers: {
            "Content-Type": "application/json"
          }
        });
      } else {
        console.log("Getting value");
        const val = await storage.getValue(key);
        return new Response(JSON.stringify({
          key,
          value: val?.value,
        }), {
          headers: {
            "Content-Type": "application/json",
          }
        });
      }
    } catch (error: any) {
      console.log(error);
    }

    return new Response("<a href='https://github.com/jacklehamster/cloudflare-worker'>Hello, World!</a>", {
      headers: { "Content-Type": "text/html" },
    });
  },
};
