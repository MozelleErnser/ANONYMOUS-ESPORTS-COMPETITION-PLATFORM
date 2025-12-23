import fs from "fs";
import path from "path";

interface SetupCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

const checks: SetupCheck[] = [];

function checkFile(filePath: string, description: string): void {
  if (fs.existsSync(filePath)) {
    checks.push({
      name: `File: ${path.basename(filePath)}`,
      status: "pass",
      message: description,
    });
  } else {
    checks.push({
      name: `File: ${path.basename(filePath)}`,
      status: "fail",
      message: `Missing: ${description}`,
    });
  }
}

function checkDirectory(dirPath: string, description: string): void {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    checks.push({
      name: `Directory: ${path.basename(dirPath)}`,
      status: "pass",
      message: description,
    });
  } else {
    checks.push({
      name: `Directory: ${path.basename(dirPath)}`,
      status: "fail",
      message: `Missing: ${description}`,
    });
  }
}

async function runSetupVerification(): Promise<void> {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   FHEVM Project Setup Verification    ║");
  console.log("╚════════════════════════════════════════╝\n");

  // Check root files
  console.log("📋 Checking root configuration files...\n");
  checkFile("./package.json", "NPM configuration");
  checkFile("./hardhat.config.ts", "Hardhat configuration");
  checkFile("./tsconfig.json", "TypeScript configuration");
  checkFile("./.env.example", "Environment template");
  checkFile("./README.md", "Project documentation");
  checkFile("./LICENSE", "License file");
  checkFile("./.gitignore", "Git ignore file");
  checkFile("./.prettierrc", "Prettier configuration");
  checkFile("./.eslintrc.json", "ESLint configuration");

  // Check directories
  console.log("\n📁 Checking project directories...\n");
  checkDirectory("./contracts", "Smart contracts");
  checkDirectory("./contracts/examples", "Example contracts");
  checkDirectory("./test", "Test files");
  checkDirectory("./test/examples", "Example tests");
  checkDirectory("./scripts", "Scripts");
  checkDirectory("./templates", "Project templates");
  checkDirectory("./docs", "Documentation");

  // Check example contracts
  console.log("\n🔧 Checking example contracts...\n");
  const exampleContracts = [
    "./contracts/examples/FHECounter.sol",
    "./contracts/examples/EncryptSingleValue.sol",
    "./contracts/examples/FHEArithmetic.sol",
    "./contracts/examples/UserDecryptSingleValue.sol",
    "./contracts/examples/AccessControlExample.sol",
    "./contracts/examples/PublicDecryption.sol",
  ];

  for (const contract of exampleContracts) {
    checkFile(contract, `Example: ${path.basename(contract)}`);
  }

  // Check example tests
  console.log("\n🧪 Checking example tests...\n");
  const exampleTests = [
    "./test/examples/FHECounter.test.ts",
    "./test/examples/EncryptSingleValue.test.ts",
    "./test/examples/FHEArithmetic.test.ts",
    "./test/examples/UserDecryptSingleValue.test.ts",
    "./test/examples/AccessControlExample.test.ts",
    "./test/examples/PublicDecryption.test.ts",
  ];

  for (const test of exampleTests) {
    checkFile(test, `Test: ${path.basename(test)}`);
  }

  // Check automation scripts
  console.log("\n⚙️  Checking automation scripts...\n");
  checkFile("./scripts/create-fhevm-example.ts", "Example generator");
  checkFile("./scripts/create-fhevm-category.ts", "Category generator");
  checkFile("./scripts/generate-docs.ts", "Documentation generator");
  checkFile("./scripts/deploy.ts", "Deployment script");

  // Check template
  console.log("\n🏗️  Checking base template...\n");
  checkDirectory("./templates/fhevm-hardhat-template", "Base template");
  checkFile("./templates/fhevm-hardhat-template/package.json", "Template package.json");
  checkFile(
    "./templates/fhevm-hardhat-template/hardhat.config.ts",
    "Template hardhat config"
  );

  // Print results
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║        Verification Results           ║");
  console.log("╚════════════════════════════════════════╝\n");

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const check of checks) {
    const icon =
      check.status === "pass" ? "✓" : check.status === "fail" ? "✗" : "⚠";
    const color =
      check.status === "pass" ? "\x1b[32m" : check.status === "fail" ? "\x1b[31m" : "\x1b[33m";
    const reset = "\x1b[0m";

    console.log(`${color}${icon} ${check.name}${reset}`);
    console.log(`  ${check.message}\n`);

    if (check.status === "pass") passCount++;
    else if (check.status === "fail") failCount++;
    else warnCount++;
  }

  // Summary
  console.log("╔════════════════════════════════════════╗");
  console.log(`║  ✓ Passed: ${String(passCount).padEnd(4)} Warnings: ${String(warnCount).padEnd(3)}  ║`);
  console.log(`║  ✗ Failed: ${String(failCount).padEnd(4)}                      ║`);
  console.log("╚════════════════════════════════════════╝\n");

  if (failCount === 0) {
    console.log(
      "✅ \x1b[32mSetup verification completed successfully!\x1b[0m\n"
    );
    console.log("📝 Next steps:");
    console.log("   1. npm install");
    console.log("   2. cp .env.example .env");
    console.log("   3. Update .env with your configuration");
    console.log("   4. npm run compile");
    console.log("   5. npm run test\n");
  } else {
    console.log(
      `❌ \x1b[31mSetup verification failed! Please fix ${failCount} issue(s).\x1b[0m\n`
    );
    process.exit(1);
  }
}

// Run verification
runSetupVerification().catch((error) => {
  console.error("❌ Verification error:", error);
  process.exit(1);
});
