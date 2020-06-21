const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");

const parseFlake8Output = require("./parser");

const { GITHUB_TOKEN } = process.env;

async function installFlake8() {
  await exec.exec("pip install flake8");
}

async function runFlake8() {
  let output = "";
  let options = {
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
    },
  };
  await exec.exec("flake8 --exit-zero", [], options);
  return output;
}

async function createCheck(check_name, title, annotations) {
  const octokit = new github.GitHub(String(GITHUB_TOKEN));
  const res = await octokit.checks.listForRef({
    check_name,
    ...github.context.repo,
    ref: github.context.sha,
  });

  const check_run_id = res.data.check_runs[0].id;

  await octokit.checks.update({
    ...github.context.repo,
    check_run_id,
    output: {
      title,
      summary: `${annotations.length} errors(s) found`,
      annotations,
    },
  });
}

async function run() {
  try {
    await installFlake8();
    const output = await runFlake8();
    const annotations = parseFlake8Output(output);

    if (annotations.length) {
      console.log(annotations);
      const checkName = core.getInput("checkName");
      await createCheck(checkName, "flake8 failure", annotations);
      core.setFailed(annotations);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
