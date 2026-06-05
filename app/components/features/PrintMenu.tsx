"use client";

// A "print menu" button. It tags <html> with a class just for the duration of
// the print dialog, so the matching print stylesheet (globals.css) can isolate
// the menu pane on paper without affecting a plain Cmd/Ctrl+P of the page when
// this feature is off. The class is removed on afterprint (and defensively
// right after print() returns, for browsers that fire neither reliably).

const PRINT_CLASS = "printing-menu";

export function PrintMenu({ label }: { label: string }) {
  const onPrint = () => {
    const root = document.documentElement;
    root.classList.add(PRINT_CLASS);
    const cleanup = () => {
      root.classList.remove(PRINT_CLASS);
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Fallback for engines that don't fire afterprint.
    setTimeout(cleanup, 1000);
  };

  return (
    <button type="button" className="btn btn-secondary print-menu-btn" onClick={onPrint}>
      {label}
    </button>
  );
}
