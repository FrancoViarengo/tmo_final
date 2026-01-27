-- Add group_id to series
ALTER TABLE series ADD COLUMN group_id UUID REFERENCES scanlation_groups(id);

-- Add group_id to chapters
ALTER TABLE chapters ADD COLUMN group_id UUID REFERENCES scanlation_groups(id);

-- Create group_followers table
CREATE TABLE group_followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  group_id UUID REFERENCES scanlation_groups(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, group_id)
);

-- RLS for group_followers
ALTER TABLE group_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own follows" ON group_followers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow groups" ON group_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow groups" ON group_followers
  FOR DELETE USING (auth.uid() = user_id);
