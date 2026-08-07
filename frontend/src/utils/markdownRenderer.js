/**
 * markdownRenderer.js
 *
 * Lightweight markdown → HTML renderer.
 * Handles: headings, bold, italic, inline code, code blocks,
 * unordered lists, ordered lists, blockquotes, horizontal rules,
 * and paragraphs.
 *
 * No external dependency — keeps the bundle lean.
 * Sanitises output by escaping raw HTML in text nodes.
 */

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Renders inline markdown within a single line:
 * bold, italic, inline code, links.
 */
const renderInline = (text) => {
  return text
    // inline code — must come before bold/italic to avoid double-processing
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    // bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    // italic
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
};

/**
 * renderMarkdown(text: string) → string (HTML)
 *
 * Processes the full body string block by block.
 */
export const renderMarkdown = (raw) => {
  if (!raw) return "";

  const lines = raw.split("\n");
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── fenced code block ──────────────────────────────────────────────────
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      html.push(
        `<pre class="md-code-block"><code${lang ? ` class="language-${lang}"` : ""}>${codeLines.join("\n")}</code></pre>`
      );
      i++; // skip closing ```
      continue;
    }

    // ── headings ───────────────────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = renderInline(escapeHtml(headingMatch[2]));
      html.push(`<h${level} class="md-h${level}">${text}</h${level}>`);
      i++;
      continue;
    }

    // ── horizontal rule ────────────────────────────────────────────────────
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      html.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // ── blockquote ─────────────────────────────────────────────────────────
    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(renderInline(escapeHtml(lines[i].slice(2))));
        i++;
      }
      html.push(`<blockquote class="md-blockquote">${quoteLines.join("<br />")}</blockquote>`);
      continue;
    }

    // ── unordered list ─────────────────────────────────────────────────────
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(`<li class="md-li">${renderInline(escapeHtml(lines[i].slice(2)))}</li>`);
        i++;
      }
      html.push(`<ul class="md-ul">${items.join("")}</ul>`);
      continue;
    }

    // ── ordered list ───────────────────────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li class="md-li">${renderInline(escapeHtml(lines[i].replace(/^\d+\.\s/, "")))}</li>`);
        i++;
      }
      html.push(`<ol class="md-ol">${items.join("")}</ol>`);
      continue;
    }

    // ── blank line → spacing ───────────────────────────────────────────────
    if (line.trim() === "") {
      html.push('<div class="md-spacer"></div>');
      i++;
      continue;
    }

    // ── paragraph ──────────────────────────────────────────────────────────
    html.push(`<p class="md-p">${renderInline(escapeHtml(line))}</p>`);
    i++;
  }

  return html.join("");
};