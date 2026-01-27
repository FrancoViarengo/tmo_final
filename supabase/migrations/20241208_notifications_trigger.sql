-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  type text NOT NULL, -- 'reply', 'welcome', 'new_chapter'
  title text,
  content text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy (already in 0007 but ensuring here)
DROP POLICY IF EXISTS "notifications_owner_all" ON public.notifications;
CREATE POLICY "notifications_owner_all"
  ON public.notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- FUNCTION: Notify on Comment Reply
CREATE OR REPLACE FUNCTION public.handle_new_comment_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if it's a reply (has parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get the owner of the parent comment
    DECLARE
      parent_owner_id uuid;
    BEGIN
      SELECT user_id INTO parent_owner_id FROM public.comments WHERE id = NEW.parent_id;

      -- Don't notify if replying to self
      IF parent_owner_id IS NOT NULL AND parent_owner_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
          parent_owner_id,
          'reply',
          'Nueva respuesta',
          'Alguien respondió a tu comentario.',
          (CASE 
            WHEN NEW.series_id IS NOT NULL THEN '/series/' || (SELECT slug FROM public.series WHERE id = NEW.series_id)
            WHEN NEW.chapter_id IS NOT NULL THEN '/reader/' || (SELECT series_id FROM public.chapters WHERE id = NEW.chapter_id) || '/' || NEW.chapter_id
            ELSE '/'
          END)
        );
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER
DROP TRIGGER IF EXISTS on_comment_reply ON public.comments;
CREATE TRIGGER on_comment_reply
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_comment_reply();
