import ora from "ora";
import spinners from "cli-spinners";
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
  globalObj.spinner = ora({
    text: startText,
    spinner: spinners.bouncingBar,
  }).start();
}

function endSpin(endText: string) {
  globalObj.spinner.succeed(endText);
}

function stopSpin(error: any) {
  globalObj.spinner.fail("Sorry, i have error...");
  console.log(error);
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

/**
 * 현재 수정 목록 전체를 staging 후 커밋 메시지를 작성하면 push를 자동으로 수행합니다.
 */
async function push() {
  console.log("⭕  Staging All Changes");
  await $`git add .`;

  const { commitMessage } = await callCli({
    ...globalObj.cliModel.inputModel,
    name: "commitMessage",
    message: "Please input your commit message : ",
  });

  runSpin("Write commit message...");
  await $`git commit -m ${commitMessage}`;
  endSpin("Success");

  runSpin("now push...");
  await $`git push origin ${await $`git branch --show-current`}`;
  endSpin("Success");
}

/**
 * 
 */
async function pull() {
  const { stdout } = await $`git branch -a`;

  let { originBranch } = await callCli({
    ...globalObj.cliModel.listModel,
    name: "originBranch",
    message: "Select the target branch for [Pull]",
    choices: stdout
      .split("\n")
      .map((branch) => branch.trim())
      .filter((branch) => branch.substring(0, 7) !== "remotes"),
  });

  if (typeof originBranch != "string") return;
  if(originBranch.substring(0,1) === "*") {
    originBranch = originBranch.substring(2, originBranch.length)
  }

  const { stdout : stdout2 } = await $`git branch --show-current` // 자료형이 object라 꺼내지 않으면 비교 불가

  if(originBranch !== stdout2) {
      const { doMerge } = await callCli({
        ...globalObj.cliModel.inputModel,
        name: "doMerge",
        message: "Do you want to do [Merge]? (Y/N)",
      });
    
      if (typeof originBranch !== "string") return;
      if(doMerge.toLowerCase() === 'y') {
        runSpin(`change selected branch...`);
        // await $`git pull origin ${originBranch}`;
        await $`git checkout ${originBranch}`.then(
          async () => {
            endSpin("Success : Branch Changed");
            runSpin(`now pull...`);
            await $`git pull`.then(
              async () => {
              endSpin("Success : Pull");

              runSpin(`back to the branch...`);
              await $`git checkout ${stdout2}`;
              endSpin("Success : Branch Changed");

              runSpin(`now merge...`);
              await $`git merge ${stdout2}`;
              endSpin("Success : Merge");

            })
          }
        ).catch((e:any) => endSpin(e.message));
      } else {
        console.log("❌ Cancel Action")
      }
  } else {
    runSpin("now pull...");
    await $`git pull`;
    endSpin("Success");
  }
}

async function checkout() {}

async function manageBranch() {}

/**
 * ezgit의 메인 함수입니다.
 * 최초 진입점이며, 선택지에 따라 수행되는 함수가 달라집니다.
 */
async function main() {
  try {
    const { command } = await callCli({
      ...globalObj.cliModel.listModel,
      name: "command",
      message: "Please choose the action you want : ",
      choices: ["Push", "Pull"],
    });

    if (typeof command !== "string") return;

    switch (command.toLowerCase()) {
      case "push":
        await push();
        break;
      case "pull":
        await pull();
        break;
    }
  } catch (error) {
    stopSpin(error);
  }
}

main();
