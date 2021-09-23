const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

const parseFlake8Output = require("./parser");

const { GITHUB_TOKEN } = process.env;

async function installFlake8() {
  const plugins = core.getInput("plugins");
  await exec.exec(`pip install flake8 ${plugins}`);
}

async function runFlake8() {
  let output = "";
  const args = ["--exit-zero"];
  if (core.getInput("config")) {
    args.push("--config", core.getInput("config"));
  }
  args.push(core.getInput("path"));
  await exec.exec("flake8", args, {
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
    },
  });
  return output;
}

async function createCheck(check_name, title, annotations, isTest) {
  let summary = `${annotations.length} errors(s) found`;
  if (annotations.length > 50) {
    summary = `${annotations.length} errors(s) found (first 50 shown)`;
    annotations = annotations.slice(0, 50);
  }
  const output = {
    title,
    summary,
    annotations,
  };

  const octokit = github.getOctokit(String(GITHUB_TOKEN));

  const res = await octokit.checks.listForRef({
    check_name,
    ref: github.context.sha,
    ...github.context.repo,
  });

  if (res.data.check_runs.length === 0) {
    await octokit.checks.create({
      ...github.context.repo,
      name: check_name,
      head_sha: github.context.sha,
      status: "completed",
      conclusion: isTest ? "neutral" : "failure",
      output,
    });
  } else {
    const check_run_id = res.data.check_runs[0].id;
    await octokit.checks.update({
      ...github.context.repo,
      check_run_id,
      output,
    });
  }
}

async function run() {
  try {
    await installFlake8();
    const output = await runFlake8();
    const annotations = parseFlake8Output(output);

    if (annotations.length) {
      const checkName = core.getInput("checkName");
      const isTest = core.getInput("isTest") === "true";
      await createCheck(checkName, "flake8 failure", annotations, isTest);
      if (!isTest) {
        core.setFailed(annotations);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
