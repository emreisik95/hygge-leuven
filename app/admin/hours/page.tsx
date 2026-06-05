import { getOpeningHours } from "@/lib/db";
import { updateHours } from "../actions";
import { HoursRow } from "../components/HoursRow";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { decodeErrors } from "@/lib/validation";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const; // Mon..Sun

export const dynamic = "force-dynamic";
export const metadata = { title: "Hours — admin — hygge" };

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ savedHours?: string; errors?: string }>;
}) {
  const [hoursRows, params] = await Promise.all([getOpeningHours(), searchParams]);
  const errors = decodeErrors(params.errors);
  const hoursByDow = new Map(hoursRows.map((h) => [h.dayOfWeek, h] as const));

  return (
    <>
      {params.savedHours ? <Flash kind="ok">Hours saved.</Flash> : null}
      {Object.keys(errors).length > 0 ? <Flash kind="err">Please fix the errors below.</Flash> : null}

      <form action={updateHours} aria-label="Opening hours editor">
        <section className="section">
          <h2>Opening hours</h2>
          <p className="hint">
            Set per-day hours. Tick &quot;closed&quot; to mark a day off.
            The landing page derives &quot;open now&quot; status from these times in Europe/Brussels.
            Overnight ranges (e.g. 18:00 – 02:00) are supported — set the close time to the next morning.
          </p>
          <div className="hours-grid" role="group" aria-label="Weekly opening hours">
            {DAY_ORDER.map((dow) => {
              const row = hoursByDow.get(dow);
              const closed = !row || !row.opensAt || !row.closesAt;
              return (
                <HoursRow
                  key={dow}
                  dow={dow}
                  initialClosed={closed}
                  initialOpensAt={row?.opensAt ?? ""}
                  initialClosesAt={row?.closesAt ?? ""}
                  opensError={errors[`hours_${dow}_opensAt`]}
                  closesError={errors[`hours_${dow}_closesAt`]}
                />
              );
            })}
          </div>
          <SubmitButton pendingLabel="Saving…">Save hours</SubmitButton>
        </section>
      </form>
    </>
  );
}
