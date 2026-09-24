-- Run this after the 0001_events_registration_url migration.
-- Moves the sign-up link that was stashed in resources_url (and duplicated
-- into cover_url) for FutureHER Summit 2026 into the dedicated field.
UPDATE public.events
SET registration_url = 'https://eventpulse.ng/events/futureher-by-she-innovates',
    resources_url = NULL,
    cover_url = NULL
WHERE id = '69ce1429-54b8-4c79-84cf-32eecf69535f';
