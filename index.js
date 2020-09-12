const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

const parseFlake8Output = require("./parser");

const { GITHUB_TOKEN } = process.env;

async function installFlake8() {
  await exec.exec("pip install flake8");
}

async function runFlake8() {
  const path = core.getInput("path");
  let output = "";
  let options = {
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
    },
  };
  await exec.exec("flake8 "+ path + " --exit-zero", [], options);
  return output;
}

async function createCheck(check_name, title, annotations, isTest) {
  const output = {
    title,
    summary: `${annotations.length} errors(s) found`,
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
      const isTest = core.getInput("isTest");
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
