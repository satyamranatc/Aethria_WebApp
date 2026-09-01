import React, { useState } from 'react';
import { Copy, Check, Terminal, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';

function renderInlineFormatting(text) {
  if (!text) return null;
  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/`([^`]+)`/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      codeMatch ? { type: 'code', index: codeMatch.index, full: codeMatch[0], content: codeMatch[1] } : null,
      boldMatch ? { type: 'bold', index: boldMatch.index, full: boldMatch[0], content: boldMatch[1] } : null,
      italicMatch ? { type: 'italic', index: italicMatch.index, full: italicMatch[0], content: italicMatch[1] } : null,
      linkMatch ? { type: 'link', index: linkMatch.index, full: linkMatch[0], text: linkMatch[1], url: linkMatch[2] } : null
    ].filter(Boolean).sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      tokens.push(remaining);
      break;
    }

    const first = matches[0];
    if (first.index > 0) {
      tokens.push(remaining.substring(0, first.index));
    }

    if (first.type === 'code') {
      tokens.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#EEF2FF] text-[#4F46E5] font-mono text-[12.5px] border border-[#6366F1]/15 font-medium inline-block align-baseline"
        >
          {first.content}
        </code>
      );
    } else if (first.type === 'bold') {
      tokens.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-[#0F172A]">
          {first.content}
        </strong>
      );
    } else if (first.type === 'italic') {
      tokens.push(
        <em key={`italic-${keyIdx++}`} className="italic text-[#475569]">
          {first.content}
        </em>
      );
    } else if (first.type === 'link') {
      tokens.push(
        <a
          key={`link-${keyIdx++}`}
          href={first.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4F46E5] hover:text-[#3730A3] underline decoration-[#6366F1]/30 underline-offset-2 transition-colors font-medium inline-flex items-center gap-0.5"
        >
          <span>{first.text}</span>
          <ExternalLink className="w-2.5 h-2.5 inline" />
        </a>
      );
    }

    remaining = remaining.substring(first.index + first.full.length);
  }

  return tokens;
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-black/[0.08] bg-[#16161A] text-[#F4F4F5] shadow-xl shadow-black/5 font-mono text-[13px]">
      {/* Code Header with macOS Traffic Lights */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F0F12] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[11px] font-sans font-semibold text-white/40 uppercase tracking-wider ml-2">
            {language || 'code'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          aria-label="Copy code block"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34C759]" />
              <span className="text-[#34C759] text-[11px] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed select-text font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownTable({ rows }) {
  if (!rows || rows.length === 0) return null;

  const headerRow = rows[0];
  const bodyRows = rows.slice(1).filter(r => !r.every(c => c.match(/^[-:]+$/)));

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-black/[0.08] bg-white shadow-xs">
      <table className="w-full text-left text-[13.5px] border-collapse">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-black/[0.06] text-[#0F172A] font-bold">
            {headerRow.map((col, idx) => (
              <th key={idx} className="px-4 py-3 font-bold tracking-tight text-xs uppercase text-[#475569]">
                {renderInlineFormatting(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.04]">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#F8FAFC] transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-[#334155] leading-relaxed align-top">
                  {renderInlineFormatting(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FormattedMessage({ content, isAssistant }) {
  if (!content) return null;

  if (!isAssistant) {
    return <p className="whitespace-pre-wrap leading-relaxed text-[14.5px]">{content}</p>;
  }

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeBuffer = [];
  let currentParagraph = [];
  let tableBuffer = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        elements.push(
          <p key={`p-${elements.length}`} className="leading-[1.75] text-[#1E293B] text-[14.5px] my-2.5 font-normal">
            {renderInlineFormatting(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      elements.push(<MarkdownTable key={`table-${elements.length}`} rows={tableBuffer} />);
      tableBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table rows: | Col 1 | Col 2 |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushParagraph();
      const cells = line
        .split('|')
        .slice(1, -1)
        .map(c => c.trim());
      tableBuffer.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Code block start / end
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${elements.length}`}
            language={codeLanguage}
            code={codeBuffer.join('\n')}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        flushParagraph();
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <h4 key={`h3-${elements.length}`} className="text-[15.5px] font-bold text-[#0F172A] tracking-tight mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
          <span>{renderInlineFormatting(line.replace('### ', ''))}</span>
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h3 key={`h2-${elements.length}`} className="text-base sm:text-[17px] font-bold text-[#0F172A] tracking-tight mt-6 mb-2.5 pb-2 border-b border-black/[0.06] flex items-center justify-between">
          <span>{renderInlineFormatting(line.replace('## ', ''))}</span>
        </h3>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      elements.push(
        <h2 key={`h1-${elements.length}`} className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight mt-6 mb-3">
          {renderInlineFormatting(line.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushParagraph();
      elements.push(
        <div key={`quote-${elements.length}`} className="my-3.5 pl-4 py-2 border-l-2 border-[#6366F1] bg-[#EEF2FF]/40 rounded-r-xl text-sm text-[#334155] italic">
          {renderInlineFormatting(line.replace('> ', ''))}
        </div>
      );
      continue;
    }

    // Numbered Lists
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushParagraph();
      elements.push(
        <div key={`num-${elements.length}`} className="flex items-start gap-3 my-2 text-[#334155]">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[11px] font-bold text-[#4F46E5] flex items-center justify-center mt-0.5 shadow-2xs">
            {numMatch[1]}
          </span>
          <span className="leading-relaxed flex-1 text-[14.5px]">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Bullet Lists
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      elements.push(
        <div key={`bullet-${elements.length}`} className="flex items-start gap-2.5 my-1.5 text-[#334155]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2.5 flex-shrink-0" />
          <span className="leading-relaxed flex-1 text-[14.5px]">{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      flushParagraph();
      elements.push(
        <hr key={`hr-${elements.length}`} className="my-5 border-t border-black/[0.06]" />
      );
      continue;
    }

    // Normal paragraph line
    if (line.trim() === '') {
      flushParagraph();
    } else {
      currentParagraph.push(line);
    }
  }

  flushTable();
  flushParagraph();

  return <div className="space-y-1">{elements}</div>;
}
