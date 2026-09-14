/**
 * A tagged template that escapes by default.
 *
 * WHY THIS EXISTS RATHER THAN PLAIN TEMPLATE LITERALS. Every page on this
 * origin will eventually interpolate something a producer typed: a product
 * name, a store URL, an editor's rejection reason. A plain `${}` in a string
 * literal is an XSS hole the moment the first real value arrives, and the day
 * it arrives is not the day anyone will remember to add escaping. Escaping by
 * default and requiring `raw()` to opt out inverts that: unsafe becomes the
 * thing you have to type on purpose.
 *
 * There is no untrusted input on this origin today. That is exactly why this
 * is cheap to put in now.
 */

/** A string that is already HTML and must not be escaped again. */
export class Html {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

/** Opt out of escaping. Only for markup this codebase produced itself. */
export function raw(value: string): Html {
  return new Html(value);
}

/**
 * Escapes the five characters that matter inside element content and inside
 * double-quoted attribute values. Both quote forms are escaped so the same
 * function is correct in either position.
 */
export function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function render(value: unknown): string {
  if (value instanceof Html) return value.value;
  if (value == null || value === false || value === true) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  return escape(String(value));
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): Html {
  let out = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    out += render(values[i]) + (strings[i + 1] ?? "");
  }
  return new Html(out);
}
