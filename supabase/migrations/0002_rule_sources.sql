-- Source tracking + verification freshness for the Rules & Sources layer.

alter table public.airline_rules
  add column if not exists source_label text,
  add column if not exists source_type text
    check (source_type in ('airline_official','airline_pdf','third_party','community'));

alter table public.carriers
  add column if not exists verified_at date;
