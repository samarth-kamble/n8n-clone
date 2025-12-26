import type { NodeExecutor } from "@/features/executions/lib/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO : Publish "loading" state for http request

  if (!data.endpoint) {
    // TODO: Publish "Error" state for http request
    throw new NonRetriableError("HTTP Request node missing endpoint");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const option: KyOptions = { method };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      option.body = data.body;
    }

    const response = await ky(endpoint, option);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      ...context,
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
  });

  // TODO : Publish "Success" state for http request

  return result;
};
