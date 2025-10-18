const { stdout, stdin } = require("process");
const os = require("os");

let message = "";
let settings = false;
let option = 1;
let optionSet = 1;

const digits = {
  "0": [
    "  /$$$$$$ ",
    " /$$$_  $$",
    "| $$$$\\ $$",
    "| $$ $$ $$",
    "| $$\\ $$$$",
    "| $$ \\ $$$",
    "|  $$$$$$/",
    " \\______/ "
  ],
  "1": [
    "   /$$    ",
    " /$$$$    ",
    "|_  $$    ",
    "  | $$    ",
    "  | $$    ",
    "  | $$    ",
    " /$$$$$$  ",
    "|______/  "
  ],
  "2": [
    "  /$$$$$$ ",
    " /$$__  $$",
    "|__/  \\ $$",
    "  /$$$$$$/",
    " /$$____/ ",
    "| $$      ",
    "| $$$$$$$$",
    "|________/"
  ],
  "3": [
    "  /$$$$$$ ",
    " /$$__  $$",
    "|__/  \\ $$",
    "   /$$$$$/",
    "  |___  $$",
    " /$$  \\ $$",
    "|  $$$$$$/",
    " \\______/ "
  ],
  "4": [
    " /$$   /$$",
    "| $$  | $$",
    "| $$  | $$",
    "| $$$$$$$$",
    "|_____  $$",
    "      | $$",
    "      | $$",
    "      |__/"
  ],
  "5": [
    " /$$$$$$$ ",
    "| $$____/ ",
    "| $$      ",
    "| $$$$$$$ ",
    "|_____  $$",
    " /$$  \\ $$",
    "|  $$$$$$/",
    " \\______/ "
  ],
  "6": [
    "  /$$$$$$ ",
    " /$$__  $$",
    "| $$  \\__/",
    "| $$$$$$$ ",
    "| $$__  $$",
    "| $$  \\ $$",
    "|  $$$$$$/",
    " \\______/ "
  ],
  "7": [
    " /$$$$$$$$",
    "|_____ $$/",
    "     /$$/ ",
    "    /$$/  ",
    "   /$$/   ",
    "  /$$/    ",
    " /$$/     ",
    "|__/      "
  ],
  "8": [
    "  /$$$$$$ ",
    " /$$__  $$",
    "| $$  \\ $$",
    "|  $$$$$$/",
    " >$$__  $$",
    "| $$  \\ $$",
    "|  $$$$$$/",
    " \\______/ "
  ],
  "9": [
    "  /$$$$$$ ",
    " /$$__  $$",
    "| $$  \\ $$",
    "|  $$$$$$$",
    " \\____  $$",
    " /$$  \\ $$",
    "|  $$$$$$/",
    " \\______/ "
  ],
  ":": [
    "       ",
    "       ",
    " /$$   ",
    " |__/  ",
    "       ",
    " /$$   ",
    " |__/  ",
    "       ",
    "       ",
    "       ",
    "       "
  ]
};

function getTotalCpuUsage() {
  const cpus = os.cpus();

  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;

  const usage = ((total - idle) / total) * 100;
  return usage.toFixed(2);
}

function centerText(mainText, msg = "") {
  if (optionSet === 1 && !settings) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yy = String(now.getFullYear());

    msg = `\nToday's date is ${mm}/${dd}/${yy}`;
  }

  if (optionSet === 2 && !settings) {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const totalGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);
    const usedGB = (usedMemory / 1024 / 1024 / 1024).toFixed(2);

    const cpuUsage = getTotalCpuUsage();

    msg = `\nRAM: ${usedGB} GB / ${totalGB} GB\nCPU: ${cpuUsage}%`;
  }

  const width = stdout.columns || 80;
  const height = stdout.rows || 24;

  const mainLines = mainText.split("\n");
  const messageLines = msg ? msg.split("\n") : [];

  const allLines = [...mainLines, ...messageLines];
  const topPadding = Math.floor((height - allLines.length) / 2);

  process.stdout.write('\x1b[H');
  console.log("\x1b[?25l");
  console.log("\n".repeat(topPadding) + allLines.map(line => {
    const leftPadding = Math.max(0, Math.floor((width - line.length) / 2));
    return " ".repeat(leftPadding) + line;
  }).join("\n"));
}

function getBigTime() {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  let bigLines = Array(8).fill("");

  for (let char of timeStr) {
    const charLines = digits[char] || Array(8).fill("        ");
    for (let i = 0; i < 8; i++) {
      bigLines[i] += charLines[i] + "  ";
    }
  }

  return bigLines.join("\n");
}

stdout.on("resize", refreshmove);

function refresh() {
  const time = getBigTime();
  centerText(time, message);
}

function refreshmove() {
  console.clear();
  const time = getBigTime();
  centerText(time, message);
}

console.clear();
refresh();

const interval = setInterval(refresh, 1000);

stdin.setRawMode(true);
stdin.resume();
stdin.on("data", (key) => {
  const str = key.toString();

  if (str === "\u0003") {
    clearInterval(interval);
    console.log("\x1b[?25h");
    console.clear();
    process.exit();
  } else if (str === "\u001b[D") {
    handleOptions("left");
  } else if (str === "\u001b[C") {
    handleOptions("right");
  } else if (str.toLowerCase() === "s") {
    settings = !settings;
    if (!settings) {
      option = 1;
    } else {
      option = 1;
      handleOptions();
    }
    refreshmove();
  } else if (str === "\r") {
    if (settings) {
      optionSet = option;
      option = 1;
      settings = false;
      refreshmove();
      refresh();
    }
  }
});

function handleOptions(direction) {
  if (!settings) return;

  if (direction === "left" || direction === "right") {
    option = option === 1 ? 2 : 1;
  }

  if (option === 1) {
    message = "\n       \x1b[34mShow Date\x1b[0m    Data Usage\n\n← Navigate →";
  } else {
    message = "\n       Show Date \x1b[34m   Data Usage\x1b[0m\n\n← Navigate →";
  }

  refresh();
}
