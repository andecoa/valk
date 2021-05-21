const inquirer = require("inquirer");
const colors = require("colors");
const https = require("https");
const fs = require("fs");
const { keybindingOpts, configFileOpts } = require("./options");

const { log } = console;

const formatText = (keybinding, description) => {
  const keys = keybinding.split(" ");
  const formattedKeys = keys
    .map((k) => {
      if (k === "-" || k === "+") {
        return colors.cyan(k);
      }
      return colors.green(k);
    })
    .join(" ");

  const padding = 30 - keybinding.length;
  let str = formattedKeys;
  for (let i = 1; i < padding; i += 1) {
    if (i % 2 === 0) {
      str += colors.grey("·"); // middle dot U + 00B7
    } else {
      str += " ";
    }
  }

  return `${str} ${description}`;
};

const displayCode = () => {
  log(formatText("ctrl + /", "toggle line comment"));
  log(
    formatText(
      "ctrl + (shift) + enter",
      "insert a new line (up) down the current line"
    )
  );
  log(
    formatText(
      "shift + alt + up/down",
      "copy line(s) up/down (i.e. select multiple lines to copy multiple lines)"
    )
  );
  log(formatText("alt + up/down", "move line(s) up/down"));
  log(formatText("ctrl + g", "go to line"));
  log(formatText("ctrl + shift + space", "show parameter hints"));
  log(
    formatText(
      "ctrl + shift + o",
      "go to symbol (i.e. go to a variable, a function, etc. in a file)"
    )
  );
  log(
    formatText(
      "F2",
      "rename symbol (e.g. select a variable and rename other instance of that variable)"
    )
  );
  log(
    formatText(
      "ctrl + shift + m",
      "open/close problems tab (e.g. eslint errors)"
    )
  );
};

const displayFile = () => {
  log(formatText("ctrl + w", "close file"));
  log(formatText("ctrl + shift + e", "open file explorer on the sidebar"));
};

const displayView = () => {
  log(formatText("ctrl + k + t", "change theme"));
  log(formatText("ctrl + k z", "toggle Zen mode"));
};

const displayTerminal = () => {
  log(formatText("ctrl + `", "open/close the integrated terminal"));
  log(formatText("ctrl + shift + `", "open a new integrated terminal"));
  log(
    formatText(
      "ctrl + PageUp/PageDown",
      "switch terminal tabs (or page tabs no terminal open)"
    )
  );
};

const displayMisc = () => {
  log(
    formatText(
      "ctrl + shift + p",
      "open command palette (type commands for anything in VS Code)"
    )
  );
  log(formatText("ctrl + b", "open/close sidebar"));
  log(formatText("ctrl + shift + x", "open extension on the sidebar"));
  log(formatText("ctrl + z", "undo last action"));
  log(formatText("ctrl + s", "save file"));
};

const writeGitignoreJs = () => {
  const url =
    "https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore";
  const file = fs.createWriteStream("./.gitignore");

  https
    .get(url, { headers: { "User-Agent": "Valk CLI App" } }, (res) => {
      res.on("data", (chunk) => {
        log(colors.grey(`Fetching data from ${url}`));
      });
      res.on("end", () => {
        log(colors.green(`Created .gitignore for JavaScript`));
      });
      res.pipe(file);
    })
    .on("error", (e) => {
      console.error(e);
    });
};

const writeFormatOnSave = () => {
  const dir = "./.vscode";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const data = JSON.stringify(
    {
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
      },
    },
    null,
    4
  );
  fs.writeFileSync("./.vscode/settings.json", data);
  log(colors.green("Created ESLint VS Code formatOnSave config file"));
};

const handleAnswers = (answers) => {
  if (answers.mainOpt === "keybindings") {
    const option = answers.keyBindingOpt;
    switch (option) {
      case "code":
        displayCode();
        break;
      case "file":
        displayFile();
        break;
      case "view":
        displayView();
        break;
      case "terminal":
        displayTerminal();
        break;
      case "misc":
        displayMisc();
        break;
      default:
        log(colors.red("Invalid selection"));
    }
  } else if (answers.mainOpt === "configFile") {
    const option = answers.configFileOpt;
    switch (option) {
      case "gitignoreJs":
        writeGitignoreJs();
        break;
      case "formatOnSave":
        writeFormatOnSave();
        break;
      default:
        log(colors.red("Invalid selection"));
    }
  }
};

inquirer
  .prompt([
    {
      type: "list",
      name: "mainOpt",
      message: "Choose a Valk command",
      choices: [
        {
          name: "VS Code key bindings",
          value: "keybindings",
        },
        {
          name: "Create config files (e.g. .gitignore, .vscode/settings.json)",
          value: "configFile",
        },
      ],
    },
    {
      type: "list",
      name: "keyBindingOpt",
      message: "Choose VS Code key bindings",
      choices: keybindingOpts,
      when: (answers) => answers.mainOpt === "keybindings",
    },
    {
      type: "list",
      name: "configFileOpt",
      message: "Choose a file to generate",
      choices: configFileOpts,
      when: (answers) => answers.mainOpt === "configFile",
    },
  ])
  .then((answers) => {
    handleAnswers(answers);
  });
