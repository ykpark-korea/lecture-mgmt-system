const hyphenLikePattern = /[\u2010-\u2015\u2212\uff0d]/g;
const whitespacePattern = /\s+/g;

export type NormalizedCode = {
  raw: string;
  normalized: string;
  changed: boolean;
  inputLength: number;
  preview: string;
};

export function normalizeAccessCode(input: string): NormalizedCode {
  const raw = input;
  const normalized = input
    .normalize("NFKC")
    .trim()
    .replace(hyphenLikePattern, "-")
    .replace(whitespacePattern, "")
    .toUpperCase();

  return {
    raw,
    normalized,
    changed: raw !== normalized,
    inputLength: raw.length,
    preview: maskCodePreview(normalized)
  };
}

function maskCodePreview(code: string) {
  if (!code) {
    return "";
  }

  const [prefix] = code.split("-");

  if (prefix && prefix !== code) {
    return `${prefix}-******`;
  }

  return `${code.slice(0, 2)}******`;
}
