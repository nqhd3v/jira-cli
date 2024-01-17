import axios, { AxiosInstance, AxiosResponse } from "axios";
import ora from "ora";
import chalk from "chalk";

export type TRequestHandlerOptions<T> = {
  onComplete?: (data: T, s: AxiosResponse<T>["status"]) => string;
  onError?: (err: any) => string;
  onData?: (
    data: T,
    headers: AxiosResponse<T>["headers"],
    status: AxiosResponse<T>["status"]
  ) => Promise<void> | void;
  debugMode?: boolean;
};

const requestHandler =
  (instance: AxiosInstance) =>
  async <T>(
    title: string,
    request: (instance: AxiosInstance) => Promise<AxiosResponse<T>>,
    options?: TRequestHandlerOptions<T>
  ) => {
    const spinner = ora(chalk.green(title)).start();
    try {
      const res = await request(instance);
      spinner.stopAndPersist({
        symbol: chalk.blue("[i]"),
        text: options?.onComplete?.(res.data, res.status),
      });
      await options?.onData?.(res.data, res.headers, res.status);
      return res.data;
    } catch (err: any) {
      spinner.stopAndPersist({
        symbol: chalk.red("[!]"),
        text: options?.onError?.(err),
      });
      return null;
    }
  };

const blpRequest = axios.create({
  baseURL: "https://blueprint.cyberlogitec.com.vn",
  maxRedirects: 0,
});

const jiraRequest = axios.create({
  baseURL: "https://oneline.atlassian.net",
  maxRedirects: 5,
});

export const $blp = requestHandler(blpRequest);
export const $jira = requestHandler(jiraRequest);
export const $http = requestHandler(axios);
