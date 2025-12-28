import { Source } from "../types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-5-nano";

interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export async function streamChatCompletion(
  userMessage: string,
  sources: Source[],
  callbacks: StreamCallbacks
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "OpenAI API key is missing. Please set OPENAI_API_KEY in your .env.local file."
    );
    callbacks.onError?.(error);
    throw error;
  }

  const sourcesContext = sources
    .map((source, index) => {
      const body = source.content ?? source.text ?? "";
      return `[Source ${index + 1}: ${source.title ?? source.url}]\nURL: ${
        source.url
      }\n\n${body}\n\n---\n`;
    })
    .join("\n");

  const systemPrompt = `You are a helpful AI assistant analyzing documents provided by the user.

The user has provided ${sources.length} source document(s). When answering questions:
1. Base your answers on the provided sources
2. Include inline citations using the format (Source N) where N is the source number
3. If the answer cannot be found in the sources, say so clearly
4. Be concise and accurate
5. When citing, place the citation immediately after the relevant statement

Here are the sources:

${sourcesContext}`;

  try {
    callbacks.onStart?.();

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        temperature: 0.2,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          errorData.message ||
          `API request failed: ${response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          callbacks.onComplete?.(fullText);
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content?.[0]?.text;
          if (delta) {
            fullText += delta;
            callbacks.onToken?.(delta);
          }
        } catch (err) {
          // ignore malformed lines
        }
      }
    }

    callbacks.onComplete?.(fullText);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("Unknown error occurred");
    callbacks.onError?.(err);
    throw err;
  }
}
