-- Ensure carrier_reports RLS policies are correct for public submission.
-- The table itself already exists (created in a past manual migration).

-- Drop any old policy names to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.carrier_reports;
DROP POLICY IF EXISTS "Allow public inserts" ON public.carrier_reports;
DROP POLICY IF EXISTS "Allow admin all" ON public.carrier_reports;

-- Policy: anyone (including anonymous visitors) can insert reports
CREATE POLICY "Allow public inserts"
  ON public.carrier_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: authenticated users (admin) can read and update all reports
CREATE POLICY "Allow admin all"
  ON public.carrier_reports
  FOR ALL
  TO authenticated
  USING (true);