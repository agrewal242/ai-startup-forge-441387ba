-- Drop the old status constraint
ALTER TABLE trips DROP CONSTRAINT trips_status_check;

-- Add new constraint with all workflow statuses
ALTER TABLE trips ADD CONSTRAINT trips_status_check 
  CHECK (status = ANY (ARRAY[
    'draft'::text,
    'analyzing_intent'::text,
    'researching_destination'::text,
    'curating_activities'::text,
    'generating_itinerary'::text,
    'completed'::text,
    'error'::text
  ]));