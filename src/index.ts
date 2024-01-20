import { program } from "commander";
import chalk from "chalk";
import { loginBlueprint } from "./handlers/blueprint/login";
import { punchBlueprint } from "./handlers/blueprint/punch";
import { jiraShowBoards } from "./services/jira/board";
import { getJIRAAuthInfo } from "./handlers/jira";

program
  .command("login")
  .argument("<app>", "Login to app: <'jira' | 'blueprint'>")
  .option("-u, --user <USERNAME::PASSWORD>", "Username & Password")
  .option("-d, --debug", "Enable debug mode")
  .action(async (app: "jira" | "blueprint", options) => {
    if (app === "blueprint") {
      await loginBlueprint(options);
      return;
    }
    if (app === "jira") {
      await getJIRAAuthInfo(options);
      return;
    }
    console.error(chalk.red("[!] Unknown app to login!"));
  });

program
  .command("blueprint")
  .argument("<action>", "Action for Blueprint: 'punch'")
  .option("-u, --user <USERNAME::PASSWORD>", "Username & Password")
  .action(async (action, options) => {
    if (action === "punch") {
      await punchBlueprint(options);
      return;
    }
    console.error(chalk.red("[!] Unknown action for Blueprint!"));
  });

program
  .command("jira")
  .argument("<action>", "Action for JIRA: ")
  .argument("[option]", "Option for Action: 'show boards' | ''")
  .option("-u, --user <USERNAME::PASSWORD>", "Username & Password to login")
  .action(async (action, actionOpt, options) => {
    if (action === "show") {
      if (actionOpt === "boards") {
        await jiraShowBoards(options);
        return;
      }
      return;
    }
    console.error(chalk.red("[!] Unknown action for JIRA!"));
  });

program.parseAsync(process.argv);
