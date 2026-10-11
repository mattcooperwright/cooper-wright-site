// md payloads may come from chat or machine senders, so they must not carry raw HTML:
// Markdown passes it through unescaped, outside the html type's sandbox.
// No Astro imports here, so a publisher can run the same check.
import { markdownToMdast } from 'satteri';

interface Node {
  type: string;
  value?: string;
  position?: { start: { line: number } };
  children?: Node[];
}

export interface RawHtmlFinding {
  line: number;
  html: string;
}

export function findRawHtml(markdown: string): RawHtmlFinding[] {
  const findings: RawHtmlFinding[] = [];
  const walk = (node: Node) => {
    if (node.type === 'html') {
      findings.push({ line: node.position?.start.line ?? 0, html: (node.value ?? '').trim() });
    }
    node.children?.forEach(walk);
  };
  walk(markdownToMdast(markdown) as Node);
  return findings;
}
