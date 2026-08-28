import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("starts with a compact grouped hours editor when weekdays match", async () => {
  const editor = await read("app/admin/components/GroupedHoursEditor.tsx");

  assert.match(editor, /Monday – Friday/);
  assert.match(editor, /Saturday/);
  assert.match(editor, /Sunday/);
  assert.match(editor, /Edit days individually/);
  assert.match(editor, /WEEKDAY_DOWS/);
  assert.match(editor, /weekdaysMatch/);
});

test("submits the existing seven-day server action field contract", async () => {
  const editor = await read("app/admin/components/GroupedHoursEditor.tsx");

  assert.match(editor, /hours_\$\{day\.dayOfWeek\}_closed/);
  assert.match(editor, /hours_\$\{day\.dayOfWeek\}_opensAt/);
  assert.match(editor, /hours_\$\{day\.dayOfWeek\}_closesAt/);
  assert.match(editor, /DAY_ORDER\.map/);
});

test("hours page delegates the schedule controls to the grouped editor", async () => {
  const page = await read("app/admin/hours/page.tsx");

  assert.match(page, /GroupedHoursEditor/);
  assert.match(page, /hoursRows=/);
  assert.match(page, /errors=/);
  assert.doesNotMatch(page, /<HoursRow/);
});
