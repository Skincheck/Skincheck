import { getStore } from "@netlify/blobs";
import { getUser } from "@netlify/identity";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const image = form.get("image");
  if (!image || !image.type?.startsWith("image/")) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  if (image.size > 4.5 * 1024 * 1024) {
    return Response.json({ error: "File too large (max ~4.5 MB)" }, { status: 413 });
  }

  const age = form.get("age") || "";
  const itchiness = form.get("itchiness") || "";
  const locations = form.getAll("locations").join(", ");

  const store = getStore("uploads");
  const key = `${user.id}/${Date.now()}_${crypto.randomUUID()}`;

  await store.set(key, image, {
    metadata: {
      userId: user.id,
      email: user.email || "",
      age,
      itchiness,
      locations,
      uploadedAt: new Date().toISOString(),
      contentType: image.type
    }
  });

  return Response.json({ success: true, key });
};
