import chalk from "chalk";
import { PathLike } from "fs";
import fs from "fs/promises";
import ora from "ora";

const textOrFunc = (
  inp?: string | ((...params: any[]) => string | undefined),
  ...params: any[]
) => (typeof inp === "function" ? inp(...params) : inp);

export const saveFile = async (
  filepath: PathLike,
  content: string,
  options?: {
    message?: string;
    messageDone?: string;
    messageError?: string;
  }
) => {
  const spinner = ora(chalk.blue(options?.message || "Writing file")).start();
  try {
    await fs.writeFile(filepath, content, { encoding: "utf-8" });
    options?.messageDone
      ? spinner.stopAndPersist({
          symbol: chalk.blue("[i]"),
          text: options.messageDone,
        })
      : spinner.stop();
  } catch (err: any) {
    options?.messageError
      ? spinner.stopAndPersist({
          symbol: chalk.red("[!]"),
          text: options.messageError,
        })
      : spinner.stop();
    return null;
  }
};

export const readFile = async (
  filepath: PathLike,
  options?: {
    message?: string;
    messageDone?: string;
    messageError?: string;
    onData?: (content: string) => void;
    onError?: (err: any) => void;
  }
): Promise<string | null> => {
  const isExist = await isFileExist(filepath);
  if (!isExist) return null;
  const spinner = ora(chalk.blue(options?.message || "Writing file")).start();
  try {
    const data = await fs.readFile(filepath, { encoding: "utf-8" });
    options?.messageDone
      ? spinner.stopAndPersist({
          symbol: chalk.blue("[i]"),
          text: options.messageDone,
        })
      : spinner.stop();
    options?.onData?.(data);
    return data;
  } catch (err: any) {
    options?.messageError
      ? spinner.stopAndPersist({
          symbol: chalk.red("[!]"),
          text: options.messageError,
        })
      : spinner.stop();
    options?.onError?.(err);
    return null;
  }
};

export const isFileExist = async (filepath: PathLike) => {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};
