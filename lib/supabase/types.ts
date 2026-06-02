// TODO: regenerate with `npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts`
// after linking a real Supabase project — hand-written types may drift from the actual schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string | null
          description: string | null
          favicon_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title?: string | null
          description?: string | null
          favicon_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string | null
          description?: string | null
          favicon_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
        }
      }
      bookmark_tags: {
        Row: {
          bookmark_id: string
          tag_id: string
        }
        Insert: {
          bookmark_id: string
          tag_id: string
        }
        Update: {
          bookmark_id?: string
          tag_id?: string
        }
      }
    }
  }
}
