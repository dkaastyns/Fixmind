-- Align asset inventory columns with Pemda asset spreadsheet fields.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'name'
  ) THEN
    ALTER TABLE assets RENAME COLUMN name TO nama_barang;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'asset_code'
  ) THEN
    ALTER TABLE assets RENAME COLUMN asset_code TO kode_barang;
  END IF;
END $$;

ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS idpemda VARCHAR(80),
  ADD COLUMN IF NOT EXISTS nomor_register VARCHAR(80),
  ADD COLUMN IF NOT EXISTS merk_type VARCHAR(150);

UPDATE assets
SET
  idpemda = COALESCE(idpemda, 'UNKNOWN-' || left(id::text, 8)),
  nomor_register = COALESCE(nomor_register, kode_barang),
  merk_type = COALESCE(merk_type, '-')
WHERE idpemda IS NULL
   OR nomor_register IS NULL
   OR merk_type IS NULL;

ALTER TABLE assets
  ALTER COLUMN idpemda SET NOT NULL,
  ALTER COLUMN nomor_register SET NOT NULL,
  ALTER COLUMN merk_type SET NOT NULL;

ALTER TABLE assets
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS description;

ALTER TABLE assets
  DROP CONSTRAINT IF EXISTS assets_asset_code_unique;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assets_kode_barang_unique'
  ) THEN
    ALTER TABLE assets ADD CONSTRAINT assets_kode_barang_unique UNIQUE (kode_barang);
  END IF;
END $$;
