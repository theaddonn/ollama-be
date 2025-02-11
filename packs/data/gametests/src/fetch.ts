import { http, HttpRequest, HttpRequestMethod } from '@minecraft/server-net';

export const fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (input instanceof URL) {
    const response = await http.get(input.host);

    return new Response(response.body, {
      status: response.status,
      headers: response.headers.map((header): [string, string] => {
        if (header.value instanceof String) {
          return [header.key, header.value.toString()];
        } else {
          return [header.key, ''];
        }
      }),
    });
  } else if (typeof input === 'string') {
    let request = new HttpRequest(input.toString());

    if (init !== undefined) {
      if (typeof init.body === 'string') {
        request.body = init.body;
      }

      const methodMap: Record<string, HttpRequestMethod> = {
        GET: HttpRequestMethod.Get,
        POST: HttpRequestMethod.Post,
        DELETE: HttpRequestMethod.Delete,
        HEAD: HttpRequestMethod.Head,
        PUT: HttpRequestMethod.Put,
      };

      if (init.method !== undefined) {
        const method: HttpRequestMethod | undefined = methodMap[init.method];

        if (method === undefined) {
          throw new Error(`Unknown HTTP Request Method ${init.method}`);
        }

        request.method = method;
      }
    }

    const response = await http.request(request);

    return new Response(response.body, {
      status: response.status,

      headers: response.headers.map((header): [string, string] => {
        if (header.value instanceof String) {
          return [header.key, header.value.toString()];
        } else {
          return [header.key, ''];
        }
      }),
    });
  } else {
    return new Response();
  }
};
