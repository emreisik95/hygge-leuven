"use client";

import { useState } from "react";
import { MAX_TRANSLATION_CHARS } from "@/lib/validation";

type Props = {
  id: string;
  name: string;
  defaultValue: string;
  rows: number;
  lang?: string;
  className?: string;
  max?: number;
  error?: string;
};

export function CountedTextarea({
  id,
  name,
  defaultValue,
  rows,
  lang,
  className,
  max = MAX_TRANSLATION_CHARS,
  error,
}: Props) {
  const [length, setLength] = useState(defaultValue.length);
  const over = length > max;
  return (
    <>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        lang={lang}
        className={className}
        aria-invalid={over || error ? true : undefined}
        aria-describedby={`${id}-counter`}
        onChange={(e) => setLength(e.target.value.length)}
      />
      <div
        id={`${id}-counter`}
        className={over ? "char-counter char-counter-over" : "char-counter"}
        aria-live="polite"
      >
        {length}/{max}
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </>
  );
}
