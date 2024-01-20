import chalk from "chalk";
import inquirer from "inquirer";
import { $jira } from "../http";
import { JIRA_API } from "./request";
import { getJIRAAuthInfo } from "../../handlers/jira";
import { TBoardJira, TPaginationJira } from "../../types/jira";

export const jiraShowBoards = async (options: any) => {
  const auth = await getJIRAAuthInfo(options);
  if (!auth) return null;

  const data = await $jira(
    "Getting JIRA boards",
    (req) =>
      req.get<TPaginationJira<TBoardJira>>(JIRA_API.board.ALL, {
        auth,
      }),
    {
      onComplete: (data) => {
        return `Found ${chalk.yellow(data.values.length)} board(s)`;
      },
      onError: (e) => "Retrieve boards got error: " + e.message,
    }
  );
  if (!data) {
    return;
  }
  const boardOptions = data.values.reduce(
    (acc: Record<string, string>, cur) => {
      acc[cur.id] = [cur.location.projectKey, cur.name].join(" - ");
      return acc;
    },
    {}
  );
  const boardSelected = await inquirer.prompt({
    type: "list",
    name: "Select a board",
    choices: Object.values(boardOptions),
  });
  console.log("---", boardSelected);
};
