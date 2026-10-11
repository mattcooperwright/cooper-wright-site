import { describe, expect, it } from 'vitest';
import { findRawHtml } from '../src/lib/markdown-safety';

describe('findRawHtml', () => {
  it('passes plain Markdown, including code that mentions tags', () => {
    const md = '# Title\n\nA *paragraph* with a [link](https://example.com).\n\n`<script>` in code is fine.\n\n```html\n<div>also fine</div>\n```\n';
    expect(findRawHtml(md)).toEqual([]);
  });

  it('flags a script block with its line', () => {
    expect(findRawHtml('Text.\n\n<script>alert(1)</script>\n')).toEqual([
      { line: 3, html: '<script>alert(1)</script>' },
    ]);
  });

  it('flags inline tags and comments', () => {
    expect(findRawHtml('Some <b>bold</b> text.').map((f) => f.line)).toEqual([1, 1]);
    expect(findRawHtml('<!-- note -->')).toHaveLength(1);
  });

  it('treats JSX-like braces and imports as text, not code', () => {
    expect(findRawHtml("import x from 'y'\n\nTotal: {1 + 1}\n")).toEqual([]);
  });
});
