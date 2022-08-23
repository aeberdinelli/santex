import fetch from 'node-fetch';

export async function request<ResponseType>(endpoint: string, config?: any): Promise<ResponseType> {
  const response = await fetch(`${process.env.API_URL!}${endpoint}`, {
    headers: {
      'X-Auth-Token': process.env.API_KEY!
    },
    ...(config || {})
  });

  if (response.status > 200) {
    throw new Error(response.statusText);
  }

  return await response.json() as ResponseType;
}