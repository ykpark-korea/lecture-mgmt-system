alter table lectures
  add column if not exists material_type text not null default 'html',
  add column if not exists material_storage_path text,
  add column if not exists display_pdf_storage_path text;

update lectures
set
  material_type = 'html',
  material_storage_path = coalesce(material_storage_path, html_storage_path)
where html_storage_path is not null
  and material_storage_path is null;

alter table lectures
  drop constraint if exists lectures_material_type_check;

alter table lectures
  add constraint lectures_material_type_check
  check (material_type in ('html', 'pdf', 'ppt', 'pptx'));
