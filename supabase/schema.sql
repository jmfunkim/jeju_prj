-- Supabase 대시보드 > SQL Editor 에 붙여 넣어 한 번 실행하세요.
-- 계정마다 수첩(담은 장소 + 방문 도장) 한 줄. 본인 행만 읽고 쓸 수 있게 RLS 를 켭니다.
create table if not exists public.notebooks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  saved jsonb not null default '[]'::jsonb,
  stamps jsonb not null default '{}'::jsonb,
  courses jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 이미 예전 버전으로 만들어 둔 테이블이면 이 줄만으로 코스 저장 열이 추가됩니다.
alter table public.notebooks add column if not exists courses jsonb not null default '[]'::jsonb;

alter table public.notebooks enable row level security;

create policy "own notebook: select" on public.notebooks for select using (auth.uid() = user_id);
create policy "own notebook: insert" on public.notebooks for insert with check (auth.uid() = user_id);
create policy "own notebook: update" on public.notebooks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notebook: delete" on public.notebooks for delete using (auth.uid() = user_id);
