import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, type LocaleCode } from "@/lib/locale";
import { setLocale } from "../locale-actions";

export function LocaleSwitcher({ current }: { current: LocaleCode }) {
  const others = LOCALES.filter((c) => c !== current);
  return (
    <details className="locale-switcher">
      <summary
        className="locale-current"
        aria-label={`Language: ${LOCALE_NAMES[current]}. Tap to change.`}
      >
        {LOCALE_LABELS[current]}
      </summary>
      <form action={setLocale} className="locale-options" aria-label="Change language">
        {others.map((code) => (
          <button
            key={code}
            type="submit"
            name="locale"
            value={code}
            className="locale-pill"
            aria-label={LOCALE_NAMES[code]}
          >
            {LOCALE_LABELS[code]}
          </button>
        ))}
      </form>
    </details>
  );
}
