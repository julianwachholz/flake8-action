<p align="center">
  <a href="https://github.com/julianwachholz/flake8-action/actions"><img alt="flake8-action status" src="https://github.com/julianwachholz/flake8-action/workflows/units-test/badge.svg"></a>
</p>

# flake8-action

Run flake8 on your Python code.

## Usage

Create a workflow file in your repository:

```yaml
name: Code Quality

on:
  push:
    paths:
      - "**.py"

jobs:
  lint:
    name: Python Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: "3.8"
      - name: Run flake8
        uses: julianwachholz/flake8-action@v1.1.0
        with:
          checkName: "Python Lint"
          path: path/to/files
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

See the [actions tab](https://github.com/julianwachholz/flake8-action/actions) for runs of this action! :rocket:
