import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const actionsUrl = new URL("../app/admin/users/actions.ts", import.meta.url);

test("admin account mutations require an authenticated admin", async () => {
  const actions = await readFile(actionsUrl, "utf8");
  assert.match(actions, /import \{ requireAdmin \} from "@\/lib\/admin-auth"/);

  const guards = actions.match(/await requireAdmin\(\);/g) ?? [];
  assert.equal(guards.length, 2);
  assert.match(actions, /addAdmin[\s\S]*?await requireAdmin\(\);[\s\S]*?createAdmin/);
  assert.match(actions, /removeAdmin[\s\S]*?await requireAdmin\(\);[\s\S]*?deleteAdmin/);
});
