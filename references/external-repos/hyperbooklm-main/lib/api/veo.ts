export interface VeoJobResult {
  operationName: string;
  videoUri?: string;
  done: boolean;
}

export async function startVeoJob(prompt: string): Promise<string> {
  const res = await fetch("/api/veo/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to start Veo job");
  }

  const data = await res.json();
  return data.operationName;
}

export async function pollVeoJob(
  operationName: string
): Promise<VeoJobResult | null> {
  const res = await fetch("/api/veo/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operationName }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to poll Veo job");
  }

  const data = await res.json();
  if (!data.done) return null;

  return {
    operationName: data.operationName,
    videoUri: data.videoUri,
    done: true,
  };
}
