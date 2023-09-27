import ora from "ora";
import inquirer from "inquirer";
import { $ } from "execa";

const globalObj = {
  spinner: null,
  cliModel: {
    inputModel: {
      type: "input",
      name: "inputValue",
      message: "default message",
      choices: [],
    } as Cli,
    listModel: {
      type: "list",
      name: "selectValue",
      message: "default message",
      choices: [],
    } as Cli,
  },
};

function runSpin(startText: string) {
  globalObj.spinner = ora(startText).start();
}

function endSpin(endText: string) {
  globalObj.spinner.succeed(endText);
}

interface Cli {
  type:
    | "checkbox"
    | "confirm"
    | "editor"
    | "expand"
    | "input"
    | "list"
    | "number"
    | "password"
    | "rawList";
  name: string;
  message: string;
  choices?: string[];
}

async function callCli(cli: Cli) {
  return await inquirer.prompt([
    {
      type: cli.type,
      name: cli.name,
      message: cli.message,
      choices: cli.choices ? cli.choices : null,
    },
  ]);
}

async function main() {
  try {
    const { command } = await callCli({
      ...globalObj.cliModel.listModel,
      name: "command",
      message: "Please choose the action you want : ",
      choices: ["Push"],
    });

    if (typeof command !== "string") return;

    if (command.toLowerCase() === "push") {
        runSpin("커밋 목록에 수정 파일 추가 중...")
        await $`git add .`;
        endSpin('완료')

        const {commitMessage} = await callCli({
            ...globalObj.cliModel.inputModel,
            name: "commitMessage",
            message: "Please input your commit message : ",
          });

        runSpin("커밋 메세지 작성중...")
        await $`git commit -m ${commitMessage}`;
        endSpin('완료')
        //ss
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
