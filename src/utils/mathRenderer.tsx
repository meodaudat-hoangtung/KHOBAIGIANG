import React from 'react';
import katex from 'katex';

/**
 * Safely render LaTeX string to HTML
 */
export function renderLatexToHtml(latex: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false
    });
  } catch (err) {
    return `<span class="text-red-400 font-mono text-xs">[Lỗi công thức: ${latex}]</span>`;
  }
}

/**
 * Render mixed text and LaTeX ($...$ or $$...$$) into React elements
 */
export function renderMixedMathContent(content: string): React.ReactNode {
  if (!content) return null;

  // If no $ is present, return standard text with linebreaks
  if (!content.includes('$')) {
    return content;
  }

  // Regex to match $$display math$$ or $inline math$
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
  const parts = content.split(mathRegex);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          const html = renderLatexToHtml(formula, true);
          return (
            <span
              key={idx}
              className="block my-2 text-center select-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          const html = renderLatexToHtml(formula, false);
          return (
            <span
              key={idx}
              className="inline-block px-1 align-baseline select-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } else {
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        }
      })}
    </>
  );
}
