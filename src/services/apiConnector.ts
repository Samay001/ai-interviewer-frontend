import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const axiosInstance = axios.create({});

interface ApiConnectorProps extends AxiosRequestConfig {
  url: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiConnector = async <T = any>({
  method = "GET",
  url,
  data,
  headers,
  params,
  ...config
}: ApiConnectorProps): Promise<AxiosResponse<T>> => {
  return axiosInstance({
    method,
    url,
    data,
    headers,
    params,
    ...config,
  });
};
