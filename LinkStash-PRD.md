# LinkStash — PRD (v1 / MVP)

> เอกสารกำหนดความต้องการ ใช้เป็นแหล่งความจริงเดียว (single source of truth) ของเฟส 1
> กฎทอง: อะไรที่ไม่อยู่ในเอกสารนี้ = ยังไม่ทำ

---

## 1. งานหลักงานเดียว (Core Job)
"เซฟลิงก์ได้ไว ระบบดึงข้อมูลเว็บให้อัตโนมัติ จัดแท็กได้ และค้นเจอภายหลัง" — สำหรับใช้ส่วนตัว

ถ้าฟีเจอร์ไหนไม่ได้รับใช้ประโยคนี้ → ไม่ใช่ของ v1

## 2. กลุ่มผู้ใช้
ผู้ใช้คนเดียวต่อบัญชี เห็นและจัดการได้เฉพาะลิงก์ของตัวเอง (บังคับด้วย Row Level Security)

## 3. Must-have (v1)
1. **Auth** — Supabase Auth: magic link (อีเมล) + Google OAuth
2. **เพิ่มลิงก์** — วาง URL → server ดึง `title`, `description`, `favicon` จาก OG/meta tags อัตโนมัติ → แสดง preview → บันทึก
3. **จัดการลิงก์** — แก้ไข / ลบ
4. **แท็ก** — เพิ่ม/ลบแท็กให้ลิงก์, กรองรายการตามแท็ก
5. **ค้นหา** — ค้นจาก title / url / description
6. **มุมมอง** — สลับ list / grid

## 4. ห้ามทำใน v1 — เก็บไว้ Phase 2+
Browser extension · public/shared links · AI auto-summary · workspace หลายผู้ใช้ · mobile app · import จาก browser bookmarks · full-text search ขั้นสูง

> ส่วนนี้สำคัญพอ ๆ กับ must-have — มันกัน Claude ไม่ให้สร้างเกินขอบเขต

## 5. User Flows หลัก
- **เข้าใช้:** ล็อกอิน (magic link/Google) → เห็น dashboard รายการลิงก์
- **เพิ่ม:** กด "Add Link" → วาง URL → ระบบดึง metadata (loading <3 วิ) → ปรับ title/แท็กได้ → Save
- **หา:** คลิกแท็ก หรือพิมพ์ในช่องค้นหา → รายการกรองแบบ realtime

## 6. Data Model (Supabase / Postgres)

**bookmarks**
| คอลัมน์ | ชนิด | หมายเหตุ |
|--------|------|---------|
| id | uuid (pk) | default gen_random_uuid() |
| user_id | uuid (fk → auth.users) | not null |
| url | text | not null |
| title | text | |
| description | text | |
| favicon_url | text | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**tags**
| id | uuid (pk) |
| user_id | uuid (fk) |
| name | text — unique ต่อ (user_id, name) |

**bookmark_tags** (junction many-to-many)
| bookmark_id | uuid (fk → bookmarks, on delete cascade) |
| tag_id | uuid (fk → tags, on delete cascade) |
| pk = (bookmark_id, tag_id) |

**RLS:** ทุกตารางเปิด RLS — policy อนุญาตเฉพาะแถวที่ `user_id = auth.uid()`

## 7. Tech Decisions
- Frontend/Backend: **Next.js 16 (App Router) + TypeScript**
- UI: **Tailwind + shadcn/ui**
- DB + Auth: **Supabase**
- Metadata: ดึงฝั่ง server ใน Route Handler (`/app/api/metadata`) ด้วย `open-graph-scraper`
- Deploy: **Vercel** (ผูก repo → auto deploy)

## 8. เกณฑ์ว่า "เสร็จ" (Success Criteria)
- เพิ่มลิงก์แล้ว metadata แสดงถูกต้องภายใน ~3 วินาที
- กรองด้วยแท็ก + ค้นหา ทำงานถูกต้อง
- ผู้ใช้คนหนึ่งเห็นเฉพาะข้อมูลตัวเอง (ทดสอบ RLS ด้วย 2 บัญชี)
- deploy ขึ้น Vercel แล้วใช้งานครบ flow ได้จริง
- ไม่มี secret หลุดในโค้ด (ใช้ env เท่านั้น)
