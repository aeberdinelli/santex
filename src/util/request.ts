import axios, { AxiosRequestConfig } from 'axios';

export async function request<ResponseType>(endpoint: string, config?: Partial<AxiosRequestConfig<ResponseType>>): Promise<ResponseType> {
  const response = await axios.get(`${process.env.API_URL!}${endpoint}`, {
    headers: {
      'X-Auth-Token': process.env.API_KEY!
    },
    ...(config || {})
  });

  return response.data as ResponseType;
}