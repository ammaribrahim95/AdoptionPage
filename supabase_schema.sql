-- Create the 'pets' table
create table pets (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  age text,
  gender text,
  breed text,
  description text,
  status text check (status in ('available', 'adopted')) default 'available',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the 'adoption_updates' table
create table adoption_updates (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets(id) on delete cascade,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table pets enable row level security;
alter table adoption_updates enable row level security;

-- Create policies for 'pets'
create policy "Allow public read access" on pets for select using (true);
create policy "Allow authenticated insert" on pets for insert to authenticated with check (true);
create policy "Allow authenticated update" on pets for update to authenticated using (true);
create policy "Allow authenticated delete" on pets for delete to authenticated using (true);

-- Create policies for 'adoption_updates'
create policy "Allow public read access" on adoption_updates for select using (true);
create policy "Allow authenticated insert" on adoption_updates for insert to authenticated with check (true);
create policy "Allow authenticated update" on adoption_updates for update to authenticated using (true);
create policy "Allow authenticated delete" on adoption_updates for delete to authenticated using (true);

-- Create storage bucket for pet images
insert into storage.buckets (id, name, public) values ('pet-images', 'pet-images', true);

-- Storage policies
create policy "Public Access" on storage.objects for select using ( bucket_id = 'pet-images' );
create policy "Auth Upload" on storage.objects for insert to authenticated with check ( bucket_id = 'pet-images' );
create policy "Auth Update" on storage.objects for update to authenticated using ( bucket_id = 'pet-images' );
create policy "Auth Delete" on storage.objects for delete to authenticated using ( bucket_id = 'pet-images' );
