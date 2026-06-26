-- 프로젝트 종료일을 선택값으로 변경
alter table public.projects
  alter column end_date drop not null;
