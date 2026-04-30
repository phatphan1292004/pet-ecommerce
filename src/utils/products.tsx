import type { ReactNode } from "react";

export const renderLongDescription = (text: string): ReactNode => {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  // If the whole description is a single long paragraph, try sentence-based formatting:
  if (blocks.length === 1) {
    const block = blocks[0];
    const sentenceMatches = block
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentenceMatches.length >= 3) {
      // Use first sentence as intro paragraph, remaining as list items
      return (
        <div>
          <p className="text-neutral-3 leading-relaxed mb-2">
            {sentenceMatches[0]}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-3">
            {sentenceMatches.slice(1).map((s, i) => (
              <li key={i} className="leading-relaxed">
                {s.replace(/^[\-•*\s]+/, "")}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Fallback: respect any single-line breaks inside the block
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length > 1) {
      return (
        <div>
          {lines.map((l, i) => (
            <p key={i} className="text-neutral-3 leading-relaxed">
              {l}
            </p>
          ))}
        </div>
      );
    }

    return <p className="text-neutral-3 leading-relaxed">{block}</p>;
  }

  return blocks.map((block, idx) => {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const isList = lines.every((l) => /^[-•*]\s+/.test(l));

    if (isList) {
      return (
        <ul key={idx} className="list-disc pl-6 space-y-2 text-neutral-3">
          {lines.map((line, i) => (
            <li key={i} className="leading-relaxed">
              {line.replace(/^[-•*]\s+/, "")}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={idx} className="text-neutral-3 leading-relaxed">
        {lines.join(" ")}
      </p>
    );
  });
};

export const renderWithLabel = (text: string) => {
  const idx = text.indexOf(":");
  if (idx > -1) {
    const label = text.slice(0, idx).trim();
    const rest = text.slice(idx + 1).trim();
    return (
      <>
        <span className="font-semibold text-neutral-1">{label}:</span>
        {rest ? " " : ""}
        <span className="text-neutral-2">{rest}</span>
      </>
    );
  }
  return <span className="text-neutral-2">{text}</span>;
};
