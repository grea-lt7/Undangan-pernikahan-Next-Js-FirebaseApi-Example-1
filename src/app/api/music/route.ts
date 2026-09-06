import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("id");
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return new Response("ID file musik tidak valid.", { status: 400 });
  }

  const range = request.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`,
      {
        headers: range ? { Range: range } : undefined,
        redirect: "follow",
        cache: "no-store",
      }
    );
  } catch {
    return new Response("File musik Drive tidak dapat dihubungi.", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || contentType.includes("text/html")) {
    return new Response("File musik Drive tidak dapat diambil sebagai audio.", {
      status: 502,
    });
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType || "audio/mpeg");
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Disposition", "inline");
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
