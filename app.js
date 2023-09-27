var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        },
        listModel: {
            type: "list",
            name: "selectValue",
            message: "default message",
            choices: [],
        },
    },
};
function runSpin(startText) {
    globalObj.spinner = ora({
        text: startText,
        spinner: spinners.bouncingBar,
    }).start();
}
function endSpin(endText) {
    globalObj.spinner.succeed(endText);
}
function stopSpin(error) {
    globalObj.spinner.fail("Sorry, i have error...");
    console.log(error);
}
function callCli(cli) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield inquirer.prompt([
            {
                type: cli.type,
                name: cli.name,
                message: cli.message,
                choices: cli.choices ? cli.choices : null,
            },
        ]);
    });
}
function gitPush() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("⭕  Staging All Changes");
        yield $ `git add .`;
        const { commitMessage } = yield callCli(Object.assign(Object.assign({}, globalObj.cliModel.inputModel), { name: "commitMessage", message: "Please input your commit message : " }));
        runSpin("Write commit message...");
        yield $ `git commit -m ${commitMessage}`;
        endSpin("Success");
        runSpin("now push...");
        yield $ `git push origin ${yield $ `git branch --show-current`}`;
        endSpin("Success");
    });
}
function gitPull() {
    return __awaiter(this, void 0, void 0, function* () {
        const { stdout } = yield $ `git branch -a`;
        let { originBranch } = yield callCli(Object.assign(Object.assign({}, globalObj.cliModel.listModel), { name: "originBranch", message: "Select the target branch for [Pull]", choices: stdout
                .split("\n")
                .map((branch) => branch.trim())
                .filter((branch) => branch.substring(0, 7) !== "remotes") }));
        if (typeof originBranch !== "string")
            return;
        if (originBranch.substring(0, 1) === "*") {
            originBranch = originBranch.substring(2, originBranch.length);
        }
        if (originBranch !== (yield $ `git branch --show-current`)) {
            const { doMerge } = yield callCli(Object.assign(Object.assign({}, globalObj.cliModel.inputModel), { name: "doMerge", message: "Do you want to do [Merge]? (Y/N)" }));
            if (typeof originBranch !== "string")
                return;
            if (doMerge.toLowerCase() === 'y') {
                runSpin(`merging...`);
                yield $ `git pull origin ${originBranch}`;
                endSpin("Success");
            }
            else {
                console.log("❌ Cancel Action");
            }
        }
        else {
            runSpin("now pull..");
            yield $ `git pull`;
            endSpin("Success");
        }
    });
}
/**
 *
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { command } = yield callCli(Object.assign(Object.assign({}, globalObj.cliModel.listModel), { name: "command", message: "Please choose the action you want : ", choices: ["Push", "Pull"] }));
            if (typeof command !== "string")
                return;
            switch (command.toLowerCase()) {
                case "push":
                    yield gitPush();
                    break;
                case "pull":
                    yield gitPull();
                    break;
            }
        }
        catch (error) {
            stopSpin(error);
        }
    });
}
main();
