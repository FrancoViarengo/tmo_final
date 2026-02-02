export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string | null
                    admin_id: string | null
                    created_at: string | null
                    details: Json | null
                    id: string
                    target_table: string | null
                }
                Insert: {
                    action?: string | null
                    admin_id?: string | null
                    created_at?: string | null
                    details?: Json | null
                    id?: string
                    target_table?: string | null
                }
                Update: {
                    action?: string | null
                    admin_id?: string | null
                    created_at?: string | null
                    details?: Json | null
                    id?: string
                    target_table?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "audit_logs_admin_id_fkey"
                        columns: ["admin_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            badges: {
                Row: {
                    created_at: string
                    criteria_type: string | null
                    criteria_value: number | null
                    description: string | null
                    icon_url: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string
                    criteria_type?: string | null
                    criteria_value?: number | null
                    description?: string | null
                    icon_url?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string
                    criteria_type?: string | null
                    criteria_value?: number | null
                    description?: string | null
                    icon_url?: string | null
                    id?: string
                    name: string
                }
                Relationships: []
            }
            bookmarks: {
                Row: {
                    series_id: string
                    status: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    series_id: string
                    status?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    series_id?: string
                    status?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookmarks_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookmarks_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            chapters: {
                Row: {
                    chapter_number: number
                    created_at: string | null
                    external_id: string | null
                    group_id: string | null
                    id: string
                    is_deleted: boolean | null
                    series_id: string | null
                    source: string | null
                    title: string | null
                    updated_at: string | null
                    uploader_id: string | null
                    volume_number: number | null
                }
                Insert: {
                    chapter_number: number
                    created_at?: string | null
                    external_id?: string | null
                    group_id?: string | null
                    id?: string
                    is_deleted?: boolean | null
                    series_id?: string | null
                    source?: string | null
                    title?: string | null
                    updated_at?: string | null
                    uploader_id?: string | null
                    volume_number?: number | null
                }
                Update: {
                    chapter_number?: number
                    created_at?: string | null
                    external_id?: string | null
                    group_id?: string | null
                    id?: string
                    is_deleted?: boolean | null
                    series_id?: string | null
                    source?: string | null
                    title?: string | null
                    updated_at?: string | null
                    uploader_id?: string | null
                    volume_number?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "chapters_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "scanlation_groups"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chapters_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chapters_uploader_id_fkey"
                        columns: ["uploader_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            comments: {
                Row: {
                    chapter_id: string | null
                    content: string
                    created_at: string | null
                    id: string
                    is_deleted: boolean | null
                    parent_id: string | null
                    series_id: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    chapter_id?: string | null
                    content: string
                    created_at?: string | null
                    id?: string
                    is_deleted?: boolean | null
                    parent_id?: string | null
                    series_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    chapter_id?: string | null
                    content?: string
                    created_at?: string | null
                    id?: string
                    is_deleted?: boolean | null
                    parent_id?: string | null
                    series_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_chapter_id_fkey"
                        columns: ["chapter_id"]
                        isOneToOne: false
                        referencedRelation: "chapters"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            group_followers: {
                Row: {
                    created_at: string | null
                    group_id: string
                    id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    group_id: string
                    id?: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    group_id?: string
                    id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "group_followers_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "scanlation_groups"
                        referencedColumns: ["id"]
                    },
                ]
            }
            group_members: {
                Row: {
                    created_at: string | null
                    group_id: string
                    role: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    group_id: string
                    role?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    group_id?: string
                    role?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "group_members_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "scanlation_groups"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "group_members_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            list_items: {
                Row: {
                    added_at: string | null
                    list_id: string
                    series_id: string
                }
                Insert: {
                    added_at?: string | null
                    list_id: string
                    series_id: string
                }
                Update: {
                    added_at?: string | null
                    list_id?: string
                    series_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "list_items_list_id_fkey"
                        columns: ["list_id"]
                        isOneToOne: false
                        referencedRelation: "lists"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "list_items_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                ]
            }
            lists: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    is_public: boolean | null
                    name: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_public?: boolean | null
                    name: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_public?: boolean | null
                    name?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "lists_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications: {
                Row: {
                    created_at: string | null
                    id: string
                    is_read: boolean | null
                    link: string | null
                    message: string
                    type: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    link?: string | null
                    message: string
                    type?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    link?: string | null
                    message?: string
                    type?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            pages: {
                Row: {
                    chapter_id: string | null
                    created_at: string | null
                    height: number | null
                    id: string
                    image_url: string
                    page_number: number
                    width: number | null
                }
                Insert: {
                    chapter_id?: string | null
                    created_at?: string | null
                    height?: number | null
                    id?: string
                    image_url: string
                    page_number: number
                    width?: number | null
                }
                Update: {
                    chapter_id?: string | null
                    created_at?: string | null
                    height?: number | null
                    id?: string
                    image_url?: string
                    page_number?: number
                    width?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pages_chapter_id_fkey"
                        columns: ["chapter_id"]
                        isOneToOne: false
                        referencedRelation: "chapters"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    id: string
                    reputation: number | null
                    role: Database["public"]["Enums"]["app_role"]
                    updated_at: string | null
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    id: string
                    reputation?: number | null
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string | null
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    id?: string
                    reputation?: number | null
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string | null
                    username?: string | null
                }
                Relationships: []
            }
            reactions: {
                Row: {
                    created_at: string | null
                    id: string
                    target_id: string
                    target_type: string
                    type: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    target_id: string
                    target_type: string
                    type: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    target_id?: string
                    target_type?: string
                    type?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reactions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            recommendation_cache: {
                Row: {
                    created_at: string | null
                    reasons: Json | null
                    series_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    reasons?: Json | null
                    series_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    reasons?: Json | null
                    series_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "recommendation_cache_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "recommendation_cache_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            reports: {
                Row: {
                    created_at: string | null
                    description: string
                    id: string
                    resolved: boolean | null
                    series_id: string | null
                    type: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    description: string
                    id?: string
                    resolved?: boolean | null
                    series_id?: string | null
                    type: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string
                    id?: string
                    resolved?: boolean | null
                    series_id?: string | null
                    type?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reports_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reports_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            scanlation_groups: {
                Row: {
                    created_at: string | null
                    discord: string | null
                    id: string
                    name: string
                    owner_id: string | null
                    updated_at: string | null
                    website: string | null
                }
                Insert: {
                    created_at?: string | null
                    discord?: string | null
                    id?: string
                    name: string
                    owner_id?: string | null
                    updated_at?: string | null
                    website?: string | null
                }
                Update: {
                    created_at?: string | null
                    discord?: string | null
                    id?: string
                    name?: string
                    owner_id?: string | null
                    updated_at?: string | null
                    website?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "scanlation_groups_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            series: {
                Row: {
                    created_at: string | null
                    created_by: string | null
                    description: string | null
                    external_id: string | null
                    external_thumbnail: string | null
                    id: string
                    is_deleted: boolean | null
                    language: string | null
                    slug: string | null
                    source: string | null
                    status: string | null
                    title: string
                    type: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    created_by?: string | null
                    description?: string | null
                    external_id?: string | null
                    external_thumbnail?: string | null
                    id?: string
                    is_deleted?: boolean | null
                    language?: string | null
                    slug?: string | null
                    source?: string | null
                    status?: string | null
                    title: string
                    type?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    created_by?: string | null
                    description?: string | null
                    external_id?: string | null
                    external_thumbnail?: string | null
                    id?: string
                    is_deleted?: boolean | null
                    language?: string | null
                    slug?: string | null
                    source?: string | null
                    status?: string | null
                    title?: string
                    type?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "series_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            system_settings: {
                Row: {
                    id: string
                    updated_at: string | null
                    value: Json
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    value: Json
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    value?: Json
                }
                Relationships: []
            }
            sync_queue: {
                Row: {
                    attempts: number
                    created_at: string
                    external_id: string
                    id: string
                    last_error: string | null
                    metadata: Json
                    priority: number
                    status: string
                    type: string
                    updated_at: string
                }
                Insert: {
                    attempts?: number
                    created_at?: string
                    external_id: string
                    id?: string
                    last_error?: string | null
                    metadata?: Json
                    priority?: number
                    status?: string
                    type: string
                    updated_at?: string
                }
                Update: {
                    attempts?: number
                    created_at?: string
                    external_id?: string
                    id?: string
                    last_error?: string | null
                    metadata?: Json
                    priority?: number
                    status?: string
                    type?: string
                    updated_at?: string
                }
                Relationships: []
            }
            user_badges: {
                Row: {
                    badge_id: string
                    earned_at: string | null
                    user_id: string
                }
                Insert: {
                    badge_id: string
                    earned_at?: string | null
                    user_id: string
                }
                Update: {
                    badge_id?: string
                    earned_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_badges_badge_id_fkey"
                        columns: ["badge_id"]
                        isOneToOne: false
                        referencedRelation: "badges"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            view_top_commenters: {
                Row: {
                    comment_count: number | null
                    avatar_url: string | null
                    reputation: number | null
                    user_id: string | null
                    username: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            view_top_readers: {
                Row: {
                    avatar_url: string | null
                    read_count: number | null
                    reputation: number | null
                    user_id: string | null
                    username: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reading_history_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            view_top_uploaders: {
                Row: {
                    avatar_url: string | null
                    reputation: number | null
                    upload_count: number | null
                    user_id: string | null
                    username: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "chapters_uploader_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Enums: {
            app_role: "user" | "uploader" | "editor" | "admin" | "superadmin"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
