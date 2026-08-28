import { getOpeningHours } from "@/lib/db";
import { updateHours } from "../actions";
import { GroupedHoursEditor } from "../components/GroupedHoursEditor";
import { SubmitButton } from "../ui/SubmitButton";
import { Flash } from "../ui/Flash";
import { decodeErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hours — admin — hygge" };

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ savedHours?: string; errors?: string }>;
}) {
  const [hoursRows, params] = await Promise.all([getOpeningHours(), searchParams]);
  const errors = decodeErrors(params.errors);

  return (
    <>
      <header className="admin-page-intro">
        <p className="admin-eyebrow">Schedule</p>
        <h1>Hours</h1>
        <p>Keep the weekly opening times visitors see up to date.</p>
      </header>

      {params.savedHours ? <Flash kind="ok">Hours saved.</Flash> : null}
      {Object.keys(errors).length > 0 ? <Flash kind="err">Please fix the errors below.</Flash> : null}

      <form action={updateHours} aria-label="Opening hours editor">
        <section className="section">
          <h2>Opening hours</h2>
          <p className="hint">
            Keep the public weekly schedule accurate. Changes publish as soon as you save.
          </p>
          <GroupedHoursEditor hoursRows={hoursRows} errors={errors} />
          <SubmitButton pendingLabel="Saving…">Save hours</SubmitButton>
        </section>
      </form>
    </>
  );
}
