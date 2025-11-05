import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  breaks: true,
  headerIds: true,
  mangle: false,
});

export default function MarkdownPreview({ value = "" }) {
  const html = useMemo(() => {
    const raw = marked.parse(value || "");
    return DOMPurify.sanitize(raw);
  }, [value]);

  return (
    <article
      className="prose prose-sm max-w-none dark:prose-invert
                 prose-headings:font-semibold prose-p:leading-relaxed
                 prose-ul:my-2 prose-li:my-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
