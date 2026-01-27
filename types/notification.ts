export interface Notification {
    id: string;
    user_id: string;
    type: 'reply' | 'welcome' | 'new_chapter' | 'system';
    title: string;
    content: string;
    link: string;
    is_read: boolean;
    created_at: string;
}
