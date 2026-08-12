-- The owner has supplied and approved the complete café story. Publish the
-- existing story pane in both new and already-deployed databases while keeping
-- the feature togglable from the admin afterwards.
INSERT INTO "FeatureFlag" ("key", "enabled", "updatedAt")
VALUES ('aboutStory', true, CURRENT_TIMESTAMP)
ON CONFLICT("key") DO UPDATE SET
  "enabled" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
