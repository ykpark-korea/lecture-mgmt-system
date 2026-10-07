alter table artifacts
  add column if not exists file_name text;

alter table artifacts
  drop constraint if exists artifacts_file_name_length_check;

alter table artifacts
  add constraint artifacts_file_name_length_check
  check (file_name is null or char_length(file_name) between 1 and 200);
