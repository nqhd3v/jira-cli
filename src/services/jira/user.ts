import { TUserJira } from "../../types/jira";
import { $jira, TRequestHandlerOptions } from "../http";
import chalk from "chalk";

export const getJiraMyself = async (
  username: string,
  password: string,
  options?: TRequestHandlerOptions<TUserJira>
) =>
  await $jira(
    chalk.blue("Checking your JIRA authenticate data"),
    (req) =>
      req.get<TUserJira>("/rest/api/2/myself", {
        auth: {
          username,
          password,
        },
      }),
    {
      onComplete: (d) =>
        `${chalk.blue("Authenticated for JIRA with")} ${d.displayName}`,
      onError: (e) =>
        `${chalk.red("Authenticate FAILED for JIRA with error:")} ${e.message}`,
      ...(options || {}),
    }
  );
