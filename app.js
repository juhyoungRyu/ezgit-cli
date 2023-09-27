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
    globalObj.spinner = ora(startText).start();
}
function endSpin(endText) {
    globalObj.spinner.succeed(endText);
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { command } = yield callCli(Object.assign(Object.assign({}, globalObj.cliModel.listModel), { name: "command", message: "Please choose the action you want : ", choices: ["Push"] }));
            if (typeof command !== "string")
                return;
            if (command.toLowerCase() === "push") {
                runSpin("커밋 목록에 수정 파일 추가 중...");
                yield $ `git add .`;
                endSpin('완료');
                const { commitMessage } = yield callCli(Object.assign(Object.assign({}, globalObj.cliModel.inputModel), { name: "commitMessage", message: "Please input your commit message : " }));
                runSpin("커밋 메세지 작성중...");
                yield $ `git commit -m ${commitMessage}`;
                endSpin('완료');
            }
        }
        catch (error) {
            console.error("An error occurred:", error);
        }
    });
}
main();
