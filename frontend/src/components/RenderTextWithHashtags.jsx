import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

const RenderTextWithHashtags = ({ text }) => {
  if (!text) return null;

  const cleanedText = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n");

  return (
    <div
  className="
    prose
    prose-invert

    prose-sm
    md:prose-sm

    max-w-none

    text-[13px]
    leading-6

    md:prose-p:my-2
    prose-p:my-1
    prose-p:leading-6
    prose-p:text-gray-300

    prose-headings:my-3
    prose-headings:text-white
    prose-headings:font-semibold
    prose-headings:leading-snug

    md:prose-h1:text-xl
    prose-h1:text-lg
    md:prose-h2:text-lg
    prose-h2:text-base
    md:prose-h3:text-base
    prose-h3:text-sm
    md:prose-h4:text-sm
    prose-h4:text-xs

    prose-strong:text-white
    prose-strong:font-semibold

    prose-ul:my-2
    prose-ol:my-2

    prose-li:my-1
    prose-li:text-gray-300
    prose-li:leading-6

    prose-code:text-emerald-300
    prose-code:bg-[#161b22]
    prose-code:px-1
    prose-code:py-0.5
    prose-code:rounded

    prose-code:before:content-none
    prose-code:after:content-none

    prose-pre:bg-[#0d1117]
    prose-pre:border
    prose-pre:border-[#30363d]
    prose-pre:rounded-lg
    prose-pre:p-3

    prose-blockquote:border-emerald-500
    prose-blockquote:text-gray-300

    prose-a:text-emerald-400
    prose-a:no-underline
    hover:prose-a:text-emerald-300

    prose-hr:border-[#30363d]

    prose-table:text-sm
    prose-th:border
    prose-th:border-[#30363d]
    prose-th:px-3
    prose-th:py-2

    prose-td:border
    prose-td:border-[#30363d]
    prose-td:px-3
    prose-td:py-2
  "
>
   <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    text({ children }) {
      if (typeof children !== "string") return children;

      return children.split(/(\s#\w+)/g).map((part, i) => {
        if (/^\s?#\w+/.test(part)) {
          return (
            <span
              key={i}
              className="text-white font-medium"
            >
              {part}
            </span>
          );
        }

        return part;
      });
    },

  p({ children }) {
  return (
    <p className="text-gray-300 leading-6 my-2">
      {children}
    </p>
  );
},

   h1({ children }) {
  return (
    <h1 className="md:text-xl text-lg font-semibold mt-4 mb-2 text-white">
      {children}
    </h1>
  );
},

h2({ children }) {
  return (
    <h2 className="md:text-lg text-xs font-semibold mt-4 mb-2 text-white">
      {children}
    </h2>
  );
},

h3({ children }) {
  return (
    <h3 className="md:text-base text-xs font-semibold mt-3 mb-1 text-white">
      {children}
    </h3>
  );
},

li({ children }) {
  return (
    <li className="text-gray-300 leading-6 my-1">
      {children}
    </li>
  );
},
    code({ inline, children, className, ...props }) {
      if (inline) {
        return (
          <code
            className="
              bg-[#161b22]
              text-white
              px-1.5
              py-0.5
              rounded-md
              text-sm
            "
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }}
>
  {cleanedText}
</ReactMarkdown>
    </div>
  );
};

export default RenderTextWithHashtags;