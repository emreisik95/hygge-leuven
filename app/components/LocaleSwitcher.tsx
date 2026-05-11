import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, type LocaleCode } from "@/lib/locale";
import { setLocale } from "../locale-actions";

export function LocaleSwitcher({ current }: { current: LocaleCode }) {
  return (
    <form action={setLocale} aria-label="Change language" className="locale-switcher">
      {LOCALES.map((code) => {
        const isActive = code === current;
        return (
          <button
            key={code}
            type="submit"
            name="locale"
            value={code}
            className={`locale-pill${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "true" : undefined}
            aria-label={LOCALE_NAMES[code]}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </form>
  );
}
