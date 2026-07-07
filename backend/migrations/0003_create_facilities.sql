-- Rooms & assets (facility inventory)

CREATE TYPE asset_status AS ENUM ('OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE');

CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  code        VARCHAR(50) NOT NULL,
  floor       VARCHAR(20),
  building    VARCHAR(100),
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,
  CONSTRAINT rooms_code_unique UNIQUE (code)
);

CREATE TABLE assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES rooms (id) ON DELETE RESTRICT,
  idpemda     VARCHAR(80) NOT NULL,
  kode_barang VARCHAR(50) NOT NULL,
  nomor_register VARCHAR(80) NOT NULL,
  nama_barang VARCHAR(150) NOT NULL,
  merk_type   VARCHAR(150) NOT NULL,
  status      asset_status NOT NULL DEFAULT 'OPERATIONAL',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,
  CONSTRAINT assets_kode_barang_unique UNIQUE (kode_barang)
);

CREATE INDEX idx_assets_room_id ON assets (room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rooms_is_active ON rooms (is_active) WHERE deleted_at IS NULL;
