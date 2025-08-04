// Nova Mailroom API routes
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../../prisma/generated/core');
const prisma = new PrismaClient();
const { requireRole } = require('../middleware/rbac');
const { logAudit } = require('../middleware/audit');

// RBAC: Only ops_technician, ops_lead, admin can create/update
const canEdit = requireRole(['ops_technician', 'ops_lead', 'admin']);

// POST /mailroom/packages - Create a new package record
router.post('/packages', canEdit, async (req, res) => {
  try {
    const { trackingNumber, carrier, sender, recipientId, department, packageType, assignedLocation, flags, linkedTicketId, linkedAssetId } = req.body;
    const pkg = await prisma.mailroomPackage.create({
      data: {
        trackingNumber,
        carrier,
        sender,
        recipientId,
        department,
        packageType,
        status: 'inbound',
        assignedLocation,
        flags,
        linkedTicketId,
        linkedAssetId,
      },
    });
    logAudit('mailroom_package_create', req.user, { packageId: pkg.id });
    res.status(201).json({ package: pkg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /mailroom/packages/:id/status - Update package status
router.patch('/packages/:id/status', canEdit, async (req, res) => {
  try {
    const { status } = req.body;
    const pkg = await prisma.mailroomPackage.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    logAudit('mailroom_package_status_update', req.user, { packageId: pkg.id, status });
    res.json({ package: pkg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /mailroom/packages/:id/assign-proxy - Assign proxy for pickup
router.post('/packages/:id/assign-proxy', canEdit, async (req, res) => {
  try {
    const { proxyId, expiration } = req.body;
    const pkgId = parseInt(req.params.id);
    const pkg = await prisma.mailroomPackage.findUnique({ where: { id: pkgId } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    const proxy = await prisma.proxyAuthorization.create({
      data: {
        recipientId: pkg.recipientId,
        proxyId,
        packageId: pkgId,
        expiration: expiration ? new Date(expiration) : null,
        status: 'active',
      },
    });
    logAudit('mailroom_proxy_assign', req.user, { packageId: pkgId, proxyId });
    res.status(201).json({ proxy });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /mailroom/packages/bulk - Bulk import packages
router.post('/packages/bulk', canEdit, async (req, res) => {
  try {
    const { packages } = req.body; // Array of package objects
    const created = await prisma.mailroomPackage.createMany({ data: packages });
    logAudit('mailroom_package_bulk_import', req.user, { count: created.count });
    res.status(201).json({ count: created.count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
