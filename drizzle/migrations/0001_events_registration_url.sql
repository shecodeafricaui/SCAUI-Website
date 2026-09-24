-- Adds an optional external registration link to events.
-- When set, registering for the event still records the member's
-- registration in event_registrations, then sends them to this URL
-- (e.g. an Eventbrite/Luma/Zoom page) instead of just showing the QR code.
ALTER TABLE public.events ADD COLUMN registration_url text;
