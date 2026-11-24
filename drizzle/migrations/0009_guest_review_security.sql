CREATE POLICY "Permanent customers only add reviews"
  ON public.reviews
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false)) = false
  );

CREATE POLICY "Permanent customers only upload review photos"
  ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id <> 'reviews'
    OR (SELECT COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false)) = false
  );