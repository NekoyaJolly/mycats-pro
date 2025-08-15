-- Create helpful read-only views for quick visualization

-- Cats summary view
CREATE OR REPLACE VIEW public.v_cats_summary AS
SELECT
  c.id                         AS cat_id,
  c."registrationId",
  c.name                       AS cat_name,
  c.gender,
  c."birthDate",
  c."microchipId",
  c."isActive",
  c."createdAt",
  c."updatedAt",
  b.code                       AS breed_code,
  b.name                       AS breed_name,
  cc.code                      AS coat_color_code,
  cc.name                      AS coat_color_name,
  u.email                      AS owner_email
FROM public.cats c
LEFT JOIN public.breeds b ON b.id = c."breedId"
LEFT JOIN public.coat_colors cc ON cc.id = c."colorId"
LEFT JOIN public.users u ON u.id = c."ownerId";

-- Pedigrees summary view
CREATE OR REPLACE VIEW public.v_pedigrees_summary AS
SELECT
  p.id                       AS pedigree_row_id,
  p."pedigreeId",
  p."catId",
  p."catName",
  p."catName2",
  p.gender,
  p."birthDate",
  p."registrationDate",
  p."pedigreeIssueDate",
  p."breederName",
  p."ownerName",
  p."brotherCount",
  p."sisterCount",
  p."otherNo",
  p."oldCode",
  p."createdAt",
  p."updatedAt",
  b.code                    AS breed_code,
  b.name                    AS breed_name,
  cc.code                   AS coat_color_code,
  cc.name                   AS coat_color_name,
  f."pedigreeId"             AS father_pedigree_no,
  m."pedigreeId"             AS mother_pedigree_no
FROM public.pedigrees p
LEFT JOIN public.breeds b ON b.id = p."breedId"
LEFT JOIN public.coat_colors cc ON cc.id = p."colorId"
LEFT JOIN public.pedigrees f ON f.id = p."fatherPedigreeId"
LEFT JOIN public.pedigrees m ON m.id = p."motherPedigreeId";
