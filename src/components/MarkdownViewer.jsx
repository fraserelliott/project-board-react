import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@assets/github-markdown-dark.css";

export default function MarkdownViewer({ children }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
