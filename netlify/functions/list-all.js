import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

export default async () => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const roles = user.app_metadata?.roles || [];
  if (!roles.includes("admin")) {
    return new Response("Forbidden", { status: 403 });
  }

  const store = getStore("uploads");
  const { blobs } = await store.list();

  return Response.json(blobs.map(b => ({ key: b.key, metadata: b.metadata })));
};
