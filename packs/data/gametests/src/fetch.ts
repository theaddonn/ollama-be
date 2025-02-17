import * as minecraftnet from '@minecraft/server-net';

export const fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const request = requestFetch2MC(input, init);
  const response = responseMC2Fetch(await minecraftnet.http.request(request));

  return response;
};

function addInitBody(request: minecraftnet.HttpRequest, init: RequestInit) {
  if (typeof init.body === 'string') {
    request.body = init.body;
  } else if (init.body !== undefined && init.body !== null) {
    throw new Error(`Unknown init body type ${init.body}`);
  }
}

function addInitHeaders(request: minecraftnet.HttpRequest, init: RequestInit) {
  if (init.headers !== undefined) {
    request.headers = [];

    init.headers.forEach((key: string, value: string) => {
      request.headers.push(new minecraftnet.HttpHeader(key, value));
    });
  }
}

function addInitMethod(request: minecraftnet.HttpRequest, init: RequestInit) {
  const methodMap: Record<string, minecraftnet.HttpRequestMethod> = {
    GET: minecraftnet.HttpRequestMethod.Get,
    POST: minecraftnet.HttpRequestMethod.Post,
    DELETE: minecraftnet.HttpRequestMethod.Delete,
    HEAD: minecraftnet.HttpRequestMethod.Head,
    PUT: minecraftnet.HttpRequestMethod.Put,
  };

  if (init.method !== undefined) {
    const method: minecraftnet.HttpRequestMethod | undefined =
      methodMap[init.method];

    if (method === undefined) {
      throw new Error(`Unknown HTTP Request Method ${init.method}`);
    }

    request.method = method;
  }
}

function addInitData(request: minecraftnet.HttpRequest, init?: RequestInit) {
  if (init === undefined) return;

  addInitBody(request, init);
  addInitHeaders(request, init);
  addInitMethod(request, init);

  request.timeout = 0.25;
}

function requestFetch2MC(
  input: RequestInfo | URL,
  init?: RequestInit,
): minecraftnet.HttpRequest {
  let url = undefined;

  if (input instanceof URL) url = input.host;
  else if (typeof input === 'string') url = input;
  else url = input.url;

  let request = new minecraftnet.HttpRequest(url);

  addInitData(request, init);

  return request;
}

function responseMC2Fetch(response: minecraftnet.HttpResponse): Response {
  return new Response(response.body, {
    status: response.status,
    headers: response.headers.map(
      (header: minecraftnet.HttpHeader): [string, string] => {
        if (typeof header.value === 'string') {
          return [header.key, header.value];
        } else {
          return [header.key, ''];
        }
      },
    ),
  });
}
