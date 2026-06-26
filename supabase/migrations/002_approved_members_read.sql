-- 승인된 사용자가 다른 승인된 회원 프로필을 조회할 수 있도록 허용 (담당자 선택용)

drop policy if exists "Approved users read approved profiles" on public.profiles;

create policy "Approved users read approved profiles"
  on public.profiles
  for select
  using (
    public.is_approved_user()
    and status = 'approved'
  );
