import type { NodeExecutor } from "@/features/executions/lib/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string;
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

  if (!data.variableName) {
    // TODO: Publish "Error" state for http request
    throw new NonRetriableError("HTTP Request node missing variable name");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const option: KyOptions = { method };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      option.body = data.body;
      option.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, option);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    }

    // Fallback http response only HTTP Request
    return {
      ...context,
      ...responsePayload,
    };
  });

  // TODO : Publish "Success" state for http request

  return result;
};
