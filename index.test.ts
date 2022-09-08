import tap from "tap";
import { extractTitle } from "./index.js";
import htm from "./index.js";

const sample_license: string = `Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`;
const expected_license_title: string =
  "Permission to use, copy, modify, and/or distribute";
tap.equal(extractTitle(sample_license)[0], expected_license_title);
tap.equal(extractTitle(sample_license)[1], sample_license);

const sample_program: string = `import linkifyStr from "linkify-string";

function trim_start(line: string): [string, boolean] {
  const trimmed: string = line.trimStart();
  if (trimmed.startsWith("# ")) {
    return [trimmed.slice(2), true];
  } else {
    return [trimmed, false];
  }
}
`;
const expected_program_title: string =
  'import linkifyStr from "linkify-string";';
const expected_program_body: string = `

function trim_start(line: string): [string, boolean] {
  const trimmed: string = line.trimStart();
  if (trimmed.startsWith("# ")) {
    return [trimmed.slice(2), true];
  } else {
    return [trimmed, false];
  }
}
`;
tap.strictSame(extractTitle(sample_program), [
  expected_program_title,
  expected_program_body.trimEnd(),
]);

const sample_a_very_long_line_without_newline_character: string =
  "const text_is_a_very_long_line_without_newline_character: boolean = text.length > 50;";
const expected_long_line_title: string =
  "const text_is_a_very_long_line_without_newline_cha";
tap.strictSame(
  extractTitle(sample_a_very_long_line_without_newline_character),
  [expected_long_line_title, sample_a_very_long_line_without_newline_character]
);
tap.strictSame(
  extractTitle("#" + sample_a_very_long_line_without_newline_character),
  [
    "#" + expected_long_line_title.slice(0, 50 - 1),
    "#" + sample_a_very_long_line_without_newline_character,
  ]
);
tap.strictSame(
  extractTitle("# " + sample_a_very_long_line_without_newline_character),
  [
    expected_long_line_title.slice(0, 50 - "# ".length),
    "# " + sample_a_very_long_line_without_newline_character,
  ]
);

type Sample = {
  sample: string;
  expected: [string, string];
};

const short_line_without_newline_character: Sample = {
  sample: "sample",
  expected: ["sample", ""],
};
tap.strictSame(
  extractTitle(short_line_without_newline_character.sample),
  short_line_without_newline_character.expected
);

const short_line: Sample = {
  sample: "sample\n",
  expected: ["sample", ""],
};
tap.strictSame(extractTitle(short_line.sample), short_line.expected);
tap.strictSame(extractTitle("# " + short_line.sample), short_line.expected);

const html_code: Sample = {
  sample: `<!doctype html><html lang=en>
<head>
  <link rel=icon href=data:,>
  <title>\${title}</title>
</head>
<body>
<pre>\${linkIt(body)}</pre>
</body>
</html>`,
  expected: [
    "<!doctype html><html lang=en>",
    `
<head>
  <link rel=icon href=data:,>
  <title>\${title}</title>
</head>
<body>
<pre>\${linkIt(body)}</pre>
</body>
</html>`,
  ],
};
tap.strictSame(extractTitle(html_code.sample), html_code.expected);

const readme: Sample = {
  sample: `# htm

## License

0BSD, excluding dependencies which have various licenses.`,
  expected: [
    "htm",
    `

## License

0BSD, excluding dependencies which have various licenses.`,
  ],
};
const man: Sample = {
  sample: `man - an interface to the system reference manuals
SYNOPSIS
       man [man options] [[section] page ...] ...
       man -k [apropos options] regexp ...
       man -K [man options] [section] term ...
       man -f [whatis options] page ...
       man -l [man options] file ...
       man -w|-W [man options] page ...

DESCRIPTION
       man  is  the  system's manual pager.  Each page argument given to man is normally the name of a
       program, utility or function.  The manual page associated with each of these arguments is  then
       found  and  displayed.  A section, if provided, will direct man to look only in that section of
       the manual.  The default action is to search in all of the available sections following a  pre-
       defined  order  (see  DEFAULTS),  and to show only the first page found, even if page exists in
       several sections.`,
  expected: [
    "man - an interface to the system reference manuals",
    `
SYNOPSIS
       man [man options] [[section] page ...] ...
       man -k [apropos options] regexp ...
       man -K [man options] [section] term ...
       man -f [whatis options] page ...
       man -l [man options] file ...
       man -w|-W [man options] page ...

DESCRIPTION
       man  is  the  system's manual pager.  Each page argument given to man is normally the name of a
       program, utility or function.  The manual page associated with each of these arguments is  then
       found  and  displayed.  A section, if provided, will direct man to look only in that section of
       the manual.  The default action is to search in all of the available sections following a  pre-
       defined  order  (see  DEFAULTS),  and to show only the first page found, even if page exists in
       several sections.`,
  ],
};

const samples: Sample[] = [readme, man];
samples.forEach((s) => {
  tap.strictSame(extractTitle(s.sample), s.expected);

  const [title, body]: [string, string] = s.expected;
  tap.strictSame(
    htm(s.sample),
    `<!doctype html><html lang=en>
<head>
  <link rel=icon href=data:,>
  <title>${title}</title>
</head>
<body>
<pre>${body}</pre>
</body>
</html>`
  );
});
