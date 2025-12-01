-- Enable realtime for trips table
ALTER TABLE public.trips REPLICA IDENTITY FULL;

-- Add trips table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;