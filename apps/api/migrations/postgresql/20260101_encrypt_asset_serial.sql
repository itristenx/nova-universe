-- Encrypt asset serial number column
ALTER TABLE inventory_assets
    ADD COLUMN serial_number_enc TEXT;
