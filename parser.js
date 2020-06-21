/**
 * Parse flake8 command line output
 *
 * @param {String} output
 */
function parseFlake8Output(output) {
  // Group 1: filename
  // Group 2: line number
  // Group 3: column number
  // Group 4: error code
  // Group 5: error description
  let regex = new RegExp(/^(.*?):(\d+):(\d+): (\w+\d+) (.*?)$/);
  let errors = output.split("\n");
  let annotations = [];

  const annotation_level = "failure";

  for (let i = 0; i < errors.length; i++) {
    let error = errors[i];
    let match = error.match(regex);
    if (match) {
      // Chop `./` off the front so that Github will recognize the file path
      const normalized_path = match[1].replace("./", "");
      const line = parseInt(match[2]);
      const column = parseInt(match[3]);
      const annotation = {
        path: normalized_path,
        start_line: line,
        end_line: line,
        start_column: column,
        end_column: column,
        annotation_level,
        message: `[${match[4]}] ${match[5]}`,
      };

      annotations.push(annotation);
    }
  }
  return annotations;
}

module.exports = parseFlake8Output;
