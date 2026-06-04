# LinkStash — Brand & Design Rules

> Claude: อ่านไฟล์นี้ก่อนทำงาน UI ทุกครั้ง กฎในนี้ชนะ default ของ library

## บุคลิกแบรนด์
สงบ เรียบ เร็ว — "ที่เก็บลิงก์ที่ไม่รบกวนสมาธิ" เนื้อหา (ลิงก์ของผู้ใช้) คือพระเอก
UI เป็นแค่กรอบ: ไม่มีสีฉูดฉาด ไม่มี animation เกินจำเป็น ไม่มี decoration ที่ไม่มีหน้าที่

## สี (ยึด token ของ shadcn/Tailwind)
- พื้น: `background` / การ์ด: `card` + `border` บาง 1px — ห้ามใส่เงาหนัก (เงาได้ไม่เกิน `shadow-sm`)
- ข้อความหลัก `foreground`, ข้อความรอง `muted-foreground`
- Accent ใช้สีเดียวคือ `primary` — ใช้กับ action หลักเท่านั้น (ปุ่ม Save, ลิงก์ active)
- Destructive (`destructive`) ใช้เฉพาะปุ่มลบ/ข้อความ error เท่านั้น

## Typography
- Heading ใช้ font เดิมของโปรเจค ขนาดไล่ระดับ: page title `text-2xl font-bold`, ไม่มี heading ใหญ่กว่านี้
- เนื้อหา `text-sm`, ข้อมูลรอง (hostname, วันที่) `text-xs text-muted-foreground`
- Title ของ bookmark: ตัด 1 บรรทัด (`truncate`), description ตัด 2 บรรทัด (`line-clamp-2`)

## Spacing & Layout
- Container หลัก: `max-w-3xl mx-auto` (list) — grid mode ขยายได้ถึง `max-w-5xl`
- ระยะห่างมาตรฐาน: ภายในการ์ด `p-4`, ระหว่างการ์ด `gap-3`
- Grid mode: 2 คอลัมน์บน `md`, 3 คอลัมน์บน `lg` ขึ้นไป มือถือ = 1 คอลัมน์เสมอ

## Components
- ใช้ shadcn/ui primitives ที่มีอยู่ก่อนเสมอ ห้ามติดตั้ง UI library เพิ่มโดยไม่ถาม
- ปุ่ม: action หลัก = default variant, action รอง = `ghost`, ลบ = `ghost` สีแดง → confirm เป็น `destructive`
- Toggle (เช่น list/grid): ปุ่มกลุ่มเล็ก `size="sm"` มี state ชัดว่าอันไหน active — ห้ามใช้ dropdown กับตัวเลือกแค่ 2 อัน
- Favicon: 16×16 ใน list, 20×20 ใน grid; ถ้าโหลดไม่ได้ให้ซ่อน (อย่าโชว์ broken image)

## States (ห้ามลืม)
- Empty: ข้อความสั้น + ชวนทำ action ถัดไป (เช่น "No bookmarks yet — add your first link")
- Loading: ใช้ skeleton หรือ spinner เล็ก inline — ห้าม block ทั้งหน้า
- Error: inline ใกล้จุดเกิดเหตุ `text-destructive text-sm` — ห้าม alert() / popup
- Hover การ์ด: `border` เข้มขึ้นหรือ `bg-accent` จาง ๆ พอ — ห้าม scale/lift

## Microcopy
- ภาษาอังกฤษ สั้น ตรง ไม่มีเครื่องหมายตกใจ ("Saved" ไม่ใช่ "Saved!!")
- ปุ่มใช้กริยา: Save, Cancel, Delete, Add tag
- Confirm การลบ: บอกผลลัพธ์ชัด ("Delete this bookmark?") ไม่ใช้คำขู่
