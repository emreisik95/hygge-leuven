import Link from "next/link";

import { AdminStatusRail } from "./components/AdminStatusRail";
import {
  getDraftContent,
  getOpeningHours,
  hasUnpublishedDraft,
  prisma,
} from "@/lib/db";
import { computeIsOpen, formatRowRange } from "@/lib/hours";
import { getCurrentMenuMetadata } from "@/lib/menu-document";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview — admin — hygge" };

function greeting(now: Date): "Good morning" | "Good afternoon" | "Good evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/Brussels",
    }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function bytesLabel(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const [content, hasDraft, hours, menu, latestInstagram] = await Promise.all([
    getDraftContent(),
    hasUnpublishedDraft(),
    getOpeningHours(),
    getCurrentMenuMetadata(),
    prisma.instagramPost.findFirst({
      orderBy: { fetchedAt: "desc" },
      select: { fetchedAt: true },
    }),
  ]);
  const status = computeIsOpen(hours, now, "Europe/Brussels");
  const today = formatRowRange(status.todayRow) ?? "Closed";

  return (
    <>
      <header className="admin-page-intro">
        <p className="admin-eyebrow">{greeting(now)}</p>
        <h1>Overview</h1>
        <p>Everything needed for today at a glance.</p>
      </header>

      <AdminStatusRail
        hasDraft={hasDraft}
        isOpen={status.isOpen}
        publishedAt={content.publishedAt}
      />

      <section className="admin-overview-grid" aria-label="Current site state">
        <article className="admin-overview-card admin-overview-card-primary">
          <span className="admin-card-label">Opening today</span>
          <strong>{today}</strong>
          <p>{status.isOpen ? "The café is open now." : "The café is closed right now."}</p>
          <Link href="/admin/hours">Edit hours</Link>
        </article>

        <article className="admin-overview-card">
          <span className="admin-card-label">Current menu</span>
          <strong>Seasonal menu</strong>
          <p>{bytesLabel(menu.bytes)} · {menu.source === "uploaded" ? "Uploaded" : "Bundled"}</p>
          <Link href="/admin/menu">Update menu</Link>
        </article>

        <article className="admin-overview-card">
          <span className="admin-card-label">Content</span>
          <strong>{hasDraft ? "Draft waiting" : "Live content"}</strong>
          <p>{hasDraft ? "Review the current draft before publishing." : "No unpublished changes."}</p>
          <Link href="/admin/content">Edit content</Link>
        </article>

        <article className="admin-overview-card">
          <span className="admin-card-label">Instagram</span>
          <strong>{latestInstagram ? "Feed connected" : "Static feed"}</strong>
          <p>{latestInstagram ? "A refreshed post set is available." : "The bundled café feed is active."}</p>
          <Link href="/admin/instagram">Manage feed</Link>
        </article>
      </section>

      <section className="admin-quick-actions" aria-labelledby="quick-actions-heading">
        <div>
          <p className="admin-eyebrow">Daily tools</p>
          <h2 id="quick-actions-heading">Quick actions</h2>
        </div>
        <div className="admin-quick-actions-grid">
          <Link href="/admin/content">Edit content</Link>
          <Link href="/admin/menu">Update menu</Link>
          <Link href="/admin/hours">Change hours</Link>
          <Link href="/admin/preview">Preview site</Link>
        </div>
      </section>
    </>
  );
}
