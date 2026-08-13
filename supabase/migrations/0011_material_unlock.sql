-- 0011: 세션 자료 해금(공개일) — 2026-08-13
-- 목적: 자료를 미리 등록해두되, 멤버에게는 공개일 도래 전까지 서버(RLS)에서 숨긴다.
--       운영진은 materials_write_staff(FOR ALL = select 포함)로 상시 열람·수정.
-- 공개일 null = 즉시 공개(기존 행 동작 불변).

alter table session_materials add column 공개일 date;

drop policy materials_select_member on session_materials;
create policy materials_select_member on session_materials
  for select to authenticated
  using (is_member() and (공개일 is null or 공개일 <= current_date));
