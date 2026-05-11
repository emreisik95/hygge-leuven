-- Replace verbose EN definition body with one-line phrase.
-- NL/FR rows left untouched so locale-specific edits survive.
UPDATE "Translation"
SET "value" = 'a feeling of cozy contentment.', "updatedAt" = CURRENT_TIMESTAMP
WHERE "namespace" = 'site.definitionBody'
  AND "locale" = 'EN'
  AND "value" LIKE 'A feeling of warmth%';
