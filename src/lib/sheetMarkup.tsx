/**
 * Tiny, safe (no innerHTML) markup renderer for cheat sheets.
 *
 *   # / ## / ###        headings
 *   - item / 1. item    lists
 *   | a | b |           tables (|---| separator row optional)
 *   > text              callout
 *   ---                 divider
 *   **bold** *italic* `code` ==highlight== H~2~O x^2^
 */
import type { ReactNode } from 'react';
import type { EventWiki } from '../data/wikiData';

const INLINE = /(\*\*[^*]+\*\*|==[^=]+==|`[^`]+`|\*[^*\s][^*]*\*|~[^~\s]+~|\^[^^\s]+\^)/g;

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const parts = text.split(INLINE).filter(p => p !== '');
  return parts.map((p, i) => {
    const k = `${keyPrefix}-${i}`;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={k}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('==') && p.endsWith('==') && p.length > 4) return <mark key={k}>{p.slice(2, -2)}</mark>;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={k}>{p.slice(1, -1)}</code>;
    if (p.startsWith('~') && p.endsWith('~') && p.length > 2) return <sub key={k}>{p.slice(1, -1)}</sub>;
    if (p.startsWith('^') && p.endsWith('^') && p.length > 2) return <sup key={k}>{p.slice(1, -1)}</sup>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={k}>{p.slice(1, -1)}</em>;
    return <span key={k}>{p}</span>;
  });
}

const splitRow = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

export function renderSheet(src: string): ReactNode[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t) { i++; continue; }

    if (/^---+$/.test(t)) { out.push(<hr key={key++} />); i++; continue; }

    const h = /^(#{1,3})\s+(.*)$/.exec(t);
    if (h) {
      const level = h[1].length;
      const content = renderInline(h[2], `h${key}`);
      out.push(level === 1 ? <h1 key={key++}>{content}</h1> : level === 2 ? <h2 key={key++}>{content}</h2> : <h3 key={key++}>{content}</h3>);
      i++;
      continue;
    }

    if (/^[-*•]\s+/.test(t)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        const nested = /^\s{2,}/.test(lines[i]);
        items.push(<li key={items.length} className={nested ? 'nested' : undefined}>{renderInline(lines[i].trim().replace(/^[-*•]\s+/, ''), `li${key}-${items.length}`)}</li>);
        i++;
      }
      out.push(<ul key={key++}>{items}</ul>);
      continue;
    }

    if (/^\d+[.)]\s+/.test(t)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(<li key={items.length}>{renderInline(lines[i].trim().replace(/^\d+[.)]\s+/, ''), `ol${key}-${items.length}`)}</li>);
        i++;
      }
      out.push(<ol key={key++}>{items}</ol>);
      continue;
    }

    if (t.startsWith('|')) {
      const rows: string[][] = [];
      let hasHeader = false;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const r = lines[i].trim();
        if (/^[|\s:-]+$/.test(r) && r.includes('--')) { hasHeader = rows.length === 1; i++; continue; }
        rows.push(splitRow(r));
        i++;
      }
      const [head, ...body] = hasHeader ? rows : [null, ...rows];
      out.push(
        <table key={key++}>
          {head && <thead><tr>{head.map((c, ci) => <th key={ci}>{renderInline(c, `th${key}-${ci}`)}</th>)}</tr></thead>}
          <tbody>
            {(body as string[][]).map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{renderInline(c, `td${key}-${ri}-${ci}`)}</td>)}</tr>)}
          </tbody>
        </table>
      );
      continue;
    }

    if (t.startsWith('>')) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { parts.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
      out.push(<blockquote key={key++}>{renderInline(parts.join(' '), `bq${key}`)}</blockquote>);
      continue;
    }

    // paragraph: consecutive non-special lines, keep line breaks
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|[-*•]\s|\d+[.)]\s|\||>|---+$)/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(
      <p key={key++}>
        {para.map((l, li) => <span key={li}>{renderInline(l, `p${key}-${li}`)}{li < para.length - 1 && <br />}</span>)}
      </p>
    );
  }
  return out;
}

/** Convert an event wiki page into starter cheat-sheet markup. */
export function wikiToMarkup(w: EventWiki): string {
  const out: string[] = [`# ${w.name}`, ''];
  for (const s of w.subtopics) {
    out.push(`## ${s.title}`);
    for (const b of s.blocks) {
      if (b.type === 'heading' && b.content) out.push(`### ${b.content}`);
      else if (b.type === 'paragraph' && b.content) out.push(b.content, '');
      else if (b.type === 'list' && b.items) {
        b.items.forEach(item => {
          const [bold, ...rest] = item.split(': ');
          out.push(rest.length ? `- **${bold}:** ${rest.join(': ')}` : `- ${item}`);
        });
        out.push('');
      } else if (b.type === 'table' && b.headers && b.rows) {
        out.push(`| ${b.headers.join(' | ')} |`, `| ${b.headers.map(() => '---').join(' | ')} |`);
        b.rows.forEach(r => out.push(`| ${r.join(' | ')} |`));
        out.push('');
      }
    }
    out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
