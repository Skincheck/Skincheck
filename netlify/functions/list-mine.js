import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

export default async () => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const store = getStore("uploads");
  const { blobs } = await store.list({ prefix: `${user.id}/` });

  return Response.json(blobs.map(b => ({ key: b.key, metadata: b.metadata })));
};
