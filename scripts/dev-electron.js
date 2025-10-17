const { spawn } = require("child_process");
const http = require("http");

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      // Check if it's actually a Next.js server by looking for Next.js headers
      if (
        res.headers["x-powered-by"] === "Next.js" ||
        res.headers["server"]?.includes("next")
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on("error", () => {
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function findNextJsPort() {
  // Try common ports
  const ports = [3000, 3001, 3002, 3003, 3004, 3005];

  // Try multiple times with delays to catch Next.js as it starts
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const port of ports) {
      const isAvailable = await checkPort(port);
      if (isAvailable) {
        console.log(`Found Next.js running on port ${port}`);
        return port;
      }
    }

    if (attempt < 2) {
      console.log(
        `Attempt ${attempt + 1}: Next.js not found, waiting 2 seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("Next.js not found on common ports, defaulting to 3000");
  return 3000;
}

async function startElectron() {
  const port = await findNextJsPort();

  // Set environment variables
  process.env.PORT = port.toString();
  process.env.NODE_ENV = "development";

  console.log(`Starting Electron with port ${port}`);

  // Start Electron
  const electron = spawn("node_modules\\.bin\\electron.cmd", ["."], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  electron.on("close", (code) => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });
}

startElectron().catch(console.error);
