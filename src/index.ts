import { program } from "commander";
import chalk from "chalk";
import { loginJira } from "./handlers/jira";
import { loginBlueprint } from "./handlers/blueprint/login";
import { punchBlueprint } from "./handlers/blueprint/punch";

program
  .command("login")
  .argument("<app>", "Login to app: <'jira' | 'blueprint'>")
  .option("-u, --user <USERNAME>", "Username")
  .option("-p, --pass <PASSWORD>", "Password")
  .option("-d, --debug", "Enable debug mode")
  .action(async (app: "jira" | "blueprint", options) => {
    if (app === "blueprint") {
      await loginBlueprint(options);
      return;
    }
    if (app === "jira") {
      await loginJira(options);
      return;
    }
    console.error(chalk.red("[!] Unknown app to login!"));
  });

program
  .command("blueprint")
  .argument("<action>", "Action for Blueprint: 'punch'")
  .option("-u, --user <USERNAME>", "Username")
  .option("-p, --pass <PASSWORD>", "Password")
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
  .option("-u, --user <USERNAME>", "Username")
  .option("-p, --pass <PASSWORD>", "Password")
  .action(async (action, options) => {});

program.parseAsync(process.argv);
