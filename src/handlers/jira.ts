import chalk from "chalk";
import PromptSync from "prompt-sync";
import { $JIRA_REQ } from "../services/jira";
import { saveFile } from "../services/file";
import { CREDENTIAL_FILENAME } from "../utils/constants";
const promptCmd = PromptSync();

export const loginJira = async (options: any) => {
  console.log(
    chalk.gray(
      "    JIRA Authenticate with Username & " +
        (options.token ? "API-Token" : "Password")
    )
  );

  const defaultAuth: { username: string; password: string } = {
    username: "",
    password: "",
  };
  if (options.user && options.pass) {
    console.log(
      chalk.yellow(" +  Using", options.user, chalk.yellow("-"), options.pass)
    );
    defaultAuth.username = options.user;
    defaultAuth.password = options.pass;
  }

  const username =
    defaultAuth.username || promptCmd(chalk.yellow(" +  Username: "));
  const password =
    defaultAuth.password ||
    (options.token
      ? promptCmd(chalk.yellow(" +  Access-Token: "))
      : promptCmd.hide(chalk.yellow(" +  Password: ")));

  const jiraUser = await $JIRA_REQ.myself(username, password, {
    debugMode: options && options.debug,
  });
  if (!jiraUser) return;

  await saveFile(
    `./jira.${CREDENTIAL_FILENAME}`,
    JSON.stringify({ username, password }),
    {
      message: "Saving JIRA credential to use in next time",
      messageDone: `JIRA Credentials saved at './jira.${CREDENTIAL_FILENAME}'`,
      messageError: "Save credential for JIRA FAILED",
    }
  );
};
