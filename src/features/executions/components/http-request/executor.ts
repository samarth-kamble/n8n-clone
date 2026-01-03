import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

import type { NodeExecutor } from "@/features/executions/lib/types";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

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
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.endpoint) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("HTTP Request node missing endpoint");
  }

  if (!data.variableName) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("HTTP Request node missing variable name");
  }

  if (!data.method) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("HTTP Request node missing method");
  }

  try {
    const result = await step.run("http-request", async () => {
      const endpoint = Handlebars.compile(data.endpoint)(context);
      const method = data.method;

      if (!data.endpoint) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("HTTP Request node missing endpoint");
      }

      if (!data.variableName) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("HTTP Request node missing variable name");
      }

      if (!data.method) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("HTTP Request node missing method");
      }

      if (!endpoint) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("HTTP Request node missing endpoint");
      }

      if (!method) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("HTTP Request node missing method");
      }

      const option: KyOptions = { method };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resolved = Handlebars.compile(data.body || "{}")(context);
        JSON.parse(resolved);
        option.body = resolved;
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

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
