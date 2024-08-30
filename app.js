import inquirer from "inquirer";
import { sendPackets } from "./utils/sendPackets.js";

async function main() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "host",
      message: "Host address:",
      validate: (input) => (input ? true : "Host address is required"),
    },
    {
      type: "input",
      name: "port",
      message: "Port number (leave blank for random):",
      validate: (input) =>
        input === "" || !isNaN(parseInt(input))
          ? true
          : "Port must be a number",
      filter: (input) => (input === "" ? null : parseInt(input)),
    },
    {
      type: "input",
      name: "timeout",
      message: "Timeout in milliseconds (leave blank for unlimited):",
      validate: (input) =>
        input === "" || !isNaN(parseInt(input))
          ? true
          : "Timeout must be a number",
      filter: (input) => (input === "" ? null : parseInt(input)),
    },
    {
      type: "rawlist",
      name: "protocol",
      message: "Choose the protocol(1 or 2):",
      choices: ["TCP", "UDP"],
    },
    {
      type: "input",
      name: "packets",
      message: "Packets per second:",
      validate: (input) =>
        !isNaN(parseInt(input)) ? true : "Packets must be a number",
      filter: (input) => parseInt(input),
    },
    {
      type: "input",
      name: "threads",
      message: "Number of threads:",
      validate: (input) =>
        !isNaN(parseInt(input)) ? true : "Threads must be a number",
      filter: (input) => parseInt(input),
    },
  ]);

  console.log(`Host: ${answers.host}`);
  if (answers.host) {
    if (!answers.timeout) {
      const confirm = await inquirer.prompt([
        {
          type: "confirm",
          name: "continueWithoutTimeout",
          message: "Are you sure you want to continue without a timeout?",
          default: false,
        },
      ]);

      if (!confirm.continueWithoutTimeout) {
        console.log("Okay, I'll stop here.");
        process.exit();
      } else {
        sendPackets(
          answers.host,
          answers.port,
          null,
          answers.protocol,
          answers.packets,
          answers.threads
        );
        console.log("Packets sent without a timeout.");
      }
    } else {
      sendPackets(
        answers.host,
        answers.port,
        answers.timeout,
        answers.protocol,
        answers.packets,
        answers.threads
      );
      console.log(`Packets sent with a timeout of ${answers.timeout} ms.`);
    }
  }
}

main();
