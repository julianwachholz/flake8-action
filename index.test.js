const parseFlake8Output = require("./parser");

test("parse empty flake8 output", async () => {
  const annotations = parseFlake8Output("");
  expect(annotations).toEqual([]);
});

test("parse flake8 output", async () => {
  const annotations = parseFlake8Output(
    "./myproject/settings.py:11:1: F401 'os' imported but unused\n" +
      "./users/views.py:1:1: F401 'django.shortcuts.render' imported but unused\n" +
      "./myproject/urls.py:7:47: E231 missing whitespace after ','\n" +
      "./users/admin.py:24:1: E304 blank lines found after function decorator\n"
  );

  expect(annotations.length).toEqual(4);
  expect(annotations[0]).toEqual({
    path: "myproject/settings.py",
    start_line: 11,
    end_line: 11,
    start_column: 1,
    end_column: 1,
    annotation_level: "failure",
    message: `[F401] 'os' imported but unused`,
  });
  expect(annotations[1]).toEqual({
    path: "users/views.py",
    start_line: 1,
    end_line: 1,
    start_column: 1,
    end_column: 1,
    annotation_level: "failure",
    message: `[F401] 'django.shortcuts.render' imported but unused`,
  });
  expect(annotations[2].message).toEqual("[E231] missing whitespace after ','");
  expect(annotations[3].message).toEqual(
    "[E304] blank lines found after function decorator"
  );
});
