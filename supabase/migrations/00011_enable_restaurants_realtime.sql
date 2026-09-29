-- Enable Realtime for restaurants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'restaurants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
  END IF;
END $$;

ALTER TABLE public.restaurants REPLICA IDENTITY FULL;
