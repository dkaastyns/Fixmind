-- Asset Transfer Requests

CREATE TYPE asset_transfer_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE asset_transfers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id       UUID NOT NULL REFERENCES assets (id) ON DELETE CASCADE,
  requester_id   UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  from_room_id   UUID NOT NULL REFERENCES rooms (id) ON DELETE RESTRICT,
  to_room_id     UUID NOT NULL REFERENCES rooms (id) ON DELETE RESTRICT,
  reason         TEXT NOT NULL,
  status         asset_transfer_status NOT NULL DEFAULT 'PENDING',
  reviewed_by    UUID REFERENCES users (id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT asset_transfers_room_diff CHECK (from_room_id <> to_room_id)
);

CREATE UNIQUE INDEX ux_asset_transfers_pending_asset_id ON asset_transfers (asset_id)
WHERE status = 'PENDING';

CREATE INDEX idx_asset_transfers_asset_id ON asset_transfers (asset_id);
CREATE INDEX idx_asset_transfers_requester_id ON asset_transfers (requester_id);
CREATE INDEX idx_asset_transfers_status ON asset_transfers (status);
CREATE INDEX idx_asset_transfers_created_at ON asset_transfers (created_at DESC);
