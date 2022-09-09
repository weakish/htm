import tap from "tap";
import { trimStart, extractTitle, linkIt, htm } from "../src/index.bs.js";

tap.equal(trimStart("  hello"), "hello");
tap.equal(trimStart("hello world "), "hello world");
tap.equal(trimStart("hello"), "hello");
tap.equal(trimStart("# hello"), "hello");
tap.equal(trimStart("# hello #"), "hello #");
tap.equal(trimStart("#hello"), "#hello");
tap.equal(trimStart("## hello"), "## hello");
tap.equal(trimStart(" # hello"), "hello");

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
  "Permission to use, copy, modify, and/or distribute this software for any";
const expected_license_body: string = `purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`;

tap.equal(extractTitle(sample_license)[0], expected_license_title);
tap.equal(extractTitle(sample_license)[1], expected_license_body);

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
  expected_program_body,
]);

const sample_a_very_long_line_without_newline_character: string =
  "const text_is_a_very_long_line_without_newline_character: boolean = text.length > 50;";
tap.strictSame(
  extractTitle(sample_a_very_long_line_without_newline_character),
  [sample_a_very_long_line_without_newline_character, ""]
);
tap.strictSame(
  extractTitle("#" + sample_a_very_long_line_without_newline_character),
  ["#" + sample_a_very_long_line_without_newline_character, ""]
);
tap.strictSame(
  extractTitle("# " + sample_a_very_long_line_without_newline_character),
  [sample_a_very_long_line_without_newline_character, ""]
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
    `<head>
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

type LinkSample = {
  sample: string;
  expected: string;
};

const url: LinkSample = {
  sample: `https://example.com`,
  expected: '<a href="https://example.com">https://example.com</a>',
};
const reference: LinkSample = {
  sample: `[RFC1866]: https://datatracker.ietf.org/doc/html/rfc1866`,
  expected: `[RFC1866]: <a href="https://datatracker.ietf.org/doc/html/rfc1866">https://datatracker.ietf.org/doc/html/rfc1866</a>`,
};
const inline_relative_link: LinkSample = {
  sample: "[weblog](/log)",
  expected: '<a href="/log">weblog</a>',
};
const inline_link: LinkSample = {
  sample: "[weblog](https://example.com/log)",
  expected: '<a href="https://example.com/log">weblog</a>',
};
const readme_with_links: LinkSample = {
  sample: `The returned value is a string contaning valid [HTML 2.0].

Source

https://github.com/weakish/htm

Reference

- [Hypertext Markup Language - 2.0][HTML 2.0]
- [RFC1866](/rfc1866)
- [HTML Validator](https://validator.w3.org)

[HTML 2.0]: https://www.w3.org/MarkUp/html-spec/html-spec_toc.html`,
  expected: `The returned value is a string contaning valid [HTML 2.0].

Source

<a href="https://github.com/weakish/htm">https://github.com/weakish/htm</a>

Reference

- [Hypertext Markup Language - 2.0][HTML 2.0]
- <a href="/rfc1866">RFC1866</a>
- <a href="https://validator.w3.org">HTML Validator</a>

[HTML 2.0]: <a href="https://www.w3.org/MarkUp/html-spec/html-spec_toc.html">https://www.w3.org/MarkUp/html-spec/html-spec_toc.html</a>`,
};

const links: LinkSample[] = [
  url,
  reference,
  inline_relative_link,
  inline_link,
  readme_with_links,
];
links.forEach((link) => {
  tap.equal(linkIt(link.sample), link.expected);
});

const samples: Sample[] = [readme, man];
samples.forEach((s) => {
  tap.strictSame(extractTitle(s.sample), s.expected);

  const [title, body]: [string, string] = s.expected;
  tap.strictSame(
    htm(s.sample),
    `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <pre>${body}</pre>
</body>
</html>
`
  );
});
