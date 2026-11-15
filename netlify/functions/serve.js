import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

export default async (req) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return new Response("Missing key", { status: 400 });

  const roles = user.app_metadata?.roles || [];
  const isAdmin = roles.includes("admin");
  const isOwnFile = key.startsWith(`${user.id}/`);

  if (!isAdmin && !isOwnFile) {
    return new Response("Forbidden", { status: 403 });
  }

  const store = getStore("uploads");
  const result = await store.getWithMetadata(key, { type: "blob" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.data, {
    headers: {
      "Content-Type": result.metadata?.contentType || "image/jpeg",
      "Cache-Control": "private, max-age=3600"
    }
  });
};
