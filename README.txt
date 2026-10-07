ROSTER V39.26.30 — USER ACCOUNT CREATE/DELETE FIX

แก้เฉพาะระบบบัญชีผู้ใช้งาน ไม่แก้กฎจัดตารางเวรหรือ workflow อื่น

Frontend:
- ใช้ index.html จาก V39.26.29
- Username รองรับ 2–50 ตัวอักษรตาม backend
- เรียก POST /api/admin/users เพื่อเพิ่มบัญชี
- เรียก DELETE /api/admin/users/:id เพื่อลบบัญชี

Backend Worker:
- worker-admin-users-v22.2.js
- Username validator: 2–50 ตัวอักษร
- เพิ่ม DELETE /api/admin/users/:id
- ป้องกัน Admin ลบบัญชีที่กำลังใช้งานอยู่
- revoke auth_sessions ของบัญชีที่ลบ
- บันทึก audit user_deleted

สำคัญ:
ต้อง Deploy Worker ไฟล์ worker-admin-users-v22.2.js ไปยัง Worker ที่ frontend ใช้งานจริง
(https://roster-scheduler-api.supaporn-gf.workers.dev)
ก่อนเพิ่ม/ลบบัญชีจึงจะทำงานจริง

ห้ามนำเฉพาะ index.html ไปแทน Worker เพราะ API เพิ่ม/ลบบัญชีอยู่ฝั่ง backend
