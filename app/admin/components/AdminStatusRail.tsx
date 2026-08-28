function formatPublishedAt(value: Date | null): string {
  if (!value) return "Not published yet";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
  }).format(value);
}

export function AdminStatusRail({
  hasDraft,
  isOpen,
  publishedAt,
}: {
  hasDraft: boolean;
  isOpen: boolean;
  publishedAt: Date | null;
}) {
  return (
    <div className="admin-status-rail" aria-label="Site status">
      <span className="admin-status-pill" data-tone="live">
        <span aria-hidden="true" className="admin-status-dot" /> Live
      </span>
      <span className="admin-status-pill" data-tone={hasDraft ? "draft" : "quiet"}>
        {hasDraft ? "Draft changes" : "No draft"}
      </span>
      <span className="admin-status-pill" data-tone={isOpen ? "open" : "quiet"}>
        Café {isOpen ? "open" : "closed"}
      </span>
      <span className="admin-status-time">Published {formatPublishedAt(publishedAt)}</span>
    </div>
  );
}
