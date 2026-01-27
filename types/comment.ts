export interface Comment {
    id: string;
    user_id: string;
    series_id: string | null;
    chapter_id: string | null;
    content: string;
    parent_id: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        username: string | null;
        avatar_url: string | null;
        email: string;
    };
    replies?: Comment[];
}
