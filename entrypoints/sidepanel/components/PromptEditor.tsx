import { useCallback, useLayoutEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ElementType } from "react";
import { Bold, Code, CodeXml, Heading2, Italic, Link, List, ListOrdered, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  className?: string;
}

type FormatResult = {
  newValue: string;
  selectionStart: number;
  selectionEnd: number;
};

type Formatter = (textarea: HTMLTextAreaElement, currentValue: string) => FormatResult;

function inlineFormat(prefix: string, suffix: string, placeholder: string): Formatter {
  return (ta, val) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = val.substring(start, end);

    if (selected.length > 0) {
      return {
        newValue: val.substring(0, start) + prefix + selected + suffix + val.substring(end),
        selectionStart: start + prefix.length,
        selectionEnd: end + prefix.length,
      };
    }

    return {
      newValue: val.substring(0, start) + prefix + placeholder + suffix + val.substring(end),
      selectionStart: start + prefix.length,
      selectionEnd: start + prefix.length + placeholder.length,
    };
  };
}

function linePrefixFormat(prefix: string, placeholder: string): Formatter {
  return (ta, val) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = val.substring(start, end);

    if (selected.length > 0) {
      const lines = selected.split("\n");
      const prefixed = lines.map((line) => prefix + line).join("\n");
      return {
        newValue: val.substring(0, start) + prefixed + val.substring(end),
        selectionStart: start + prefix.length,
        selectionEnd: start + prefixed.length,
      };
    }

    let lineStart = start;
    while (lineStart > 0 && val[lineStart - 1] !== "\n") lineStart--;

    return {
      newValue: val.substring(0, lineStart) + prefix + placeholder + val.substring(lineStart),
      selectionStart: lineStart + prefix.length,
      selectionEnd: lineStart + prefix.length + placeholder.length,
    };
  };
}

function numberedListFormat(ta: HTMLTextAreaElement, val: string): FormatResult {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = val.substring(start, end);

  if (selected.length > 0) {
    const lines = selected.split("\n");
    const prefixed = lines.map((line, i) => `${i + 1}. ${line}`).join("\n");
    return {
      newValue: val.substring(0, start) + prefixed + val.substring(end),
      selectionStart: start,
      selectionEnd: start + prefixed.length,
    };
  }

  return {
    newValue: val.substring(0, start) + "1. item" + val.substring(end),
    selectionStart: start,
    selectionEnd: start + 7,
  };
}

function codeBlockFormat(ta: HTMLTextAreaElement, val: string): FormatResult {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = val.substring(start, end);

  if (selected.length > 0) {
    const needsLeadingNl = start > 0 && val[start - 1] !== "\n";
    const needsTrailingNl = end < val.length && val[end] !== "\n";
    const prefix = needsLeadingNl ? "\n```\n" : "```\n";
    const suffix = needsTrailingNl ? "\n```\n" : "\n```";
    const newValue = val.substring(0, start) + prefix + selected + suffix + val.substring(end);
    return {
      newValue,
      selectionStart: start + prefix.length + selected.length + suffix.length,
      selectionEnd: start + prefix.length + selected.length + suffix.length,
    };
  }

  const needsLeadingNl = start > 0 && val[start - 1] !== "\n";
  const prefix = needsLeadingNl ? "\n```\n" : "```\n";
  const newValue = val.substring(0, start) + prefix + "code\n```" + val.substring(end);
  const cursorPos = start + prefix.length;
  return {
    newValue,
    selectionStart: cursorPos,
    selectionEnd: cursorPos + 4,
  };
}

interface ToolbarItem {
  icon: ElementType;
  title: string;
  shortcut: string | null;
  format: Formatter;
}

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { icon: Bold, title: "Bold", shortcut: "b", format: inlineFormat("**", "**", "bold text") },
  { icon: Italic, title: "Italic", shortcut: "i", format: inlineFormat("*", "*", "emphasized text") },
  { icon: Code, title: "Inline code", shortcut: "e", format: inlineFormat("`", "`", "code") },
  { icon: CodeXml, title: "Code block", shortcut: null, format: codeBlockFormat },
  { icon: Link, title: "Link", shortcut: "k", format: inlineFormat("[", "](url)", "link text") },
  { icon: List, title: "Bullet list", shortcut: null, format: linePrefixFormat("- ", "item") },
  { icon: ListOrdered, title: "Numbered list", shortcut: null, format: numberedListFormat },
  { icon: Quote, title: "Quote", shortcut: null, format: linePrefixFormat("> ", "quote") },
  { icon: Heading2, title: "Heading", shortcut: null, format: linePrefixFormat("## ", "heading") },
];

const SHORTCUT_MAP: Record<string, Formatter> = {};
for (const item of TOOLBAR_ITEMS) {
  if (item.shortcut) {
    SHORTCUT_MAP[item.shortcut] = item.format;
  }
}

export function PromptEditor({
  value,
  onChange,
  placeholder,
  rows,
  id,
  className,
}: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCursor = useRef<{ start: number; end: number } | null>(null);

  useLayoutEffect(() => {
    if (pendingCursor.current && textareaRef.current) {
      textareaRef.current.setSelectionRange(pendingCursor.current.start, pendingCursor.current.end);
      pendingCursor.current = null;
    }
  });

  const applyFormat = useCallback(
    (formatter: Formatter) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const result = formatter(ta, value);
      pendingCursor.current = { start: result.selectionStart, end: result.selectionEnd };
      onChange(result.newValue);
      ta.focus();
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key in SHORTCUT_MAP) {
        e.preventDefault();
        applyFormat(SHORTCUT_MAP[key]);
      }
    },
    [applyFormat],
  );

  return (
    <div className={className}>
      <div className="flex gap-0.5 pb-2">
        {TOOLBAR_ITEMS.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            size="icon"
            title={item.shortcut ? `${item.title} (Ctrl+${item.shortcut.toUpperCase()})` : item.title}
            aria-label={item.title}
            onClick={() => applyFormat(item.format)}
            type="button"
          >
            <item.icon className="size-4" />
          </Button>
        ))}
      </div>
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}
