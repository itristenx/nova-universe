// Nova Mailroom API routes
import express from 'express';
import { authenticateJWT, requireAnyRole } from '../middleware/auth.js';
import { logger } from '../logger.js';

let PrismaClient = null;
async function getCorePrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../prisma/generated/core/index.js');
    PrismaClient = mod.PrismaClient;
    return new PrismaClient({ datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } } });
  } catch (e) {
    logger.warn('Prisma unavailable in Mailroom routes', { error: e?.message });
    return null;
  }
}

const prismaPromise = getCorePrisma();
const router = express.Router();

// RBAC: Only ops_technician, ops_lead, admin can create/update
const canEdit = requireAnyRole(['ops_technician', 'ops_lead', 'admin']);

// POST /mailroom/packages - Create a new package record
router.post('/packages', authenticateJWT, canEdit, async (req, res) => {
  try {
    const prisma = await prismaPromise;
    if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
    const { trackingNumber, carrier, sender, recipientId, department, packageType, assignedLocation, flags, linkedTicketId, linkedAssetId } = req.body || {};
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
    res.status(201).json({ package: pkg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /mailroom/packages/:id - Retrieve package details
router.get('/packages/:id', authenticateJWT, async (req, res) => {
  try {
    const prisma = await prismaPromise;
    if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
    const id = parseInt(req.params.id);
    const pkg = await prisma.mailroomPackage.findUnique({ where: { id } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: pkg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /mailroom/packages/:id/status - Update package status
router.patch('/packages/:id/status', authenticateJWT, canEdit, async (req, res) => {
  try {
    const prisma = await prismaPromise;
    if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
    const { status } = req.body;
    const pkg = await prisma.mailroomPackage.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json({ package: pkg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /mailroom/packages/:id/assign-proxy - Assign proxy for pickup
router.post('/packages/:id/assign-proxy', authenticateJWT, canEdit, async (req, res) => {
  try {
    const prisma = await prismaPromise;
    if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
    const { proxyId, expiration } = req.body || {};
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
    res.status(201).json({ proxy });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /mailroom/packages/:id/link-ticket - Link to ticket
router.post('/packages/:id/link-ticket', authenticateJWT, canEdit, async (req, res) => {
  try {
    const prisma = await prismaPromise;
    if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
    const id = parseInt(req.params.id);
    const { ticketId } = req.body || {};
    if (!ticketId) return res.status(400).json({ error: 'ticketId required' });
    const pkg = await prisma.mailroomPackage.update({ where: { id }, data: { linkedTicketId: ticketId } });
    res.json({ package: pkg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /mailroom/packages/bulk - Bulk import packages
router.post('/packages/bulk', authenticateJWT, canEdit, async (req, res) => {
  try {
    const prisma = await prismaPromise;
    if (!prisma) return res.status(503).json({ error: 'Database unavailable' });
    const { packages } = req.body || {};
    if (!Array.isArray(packages) || packages.length === 0) return res.status(400).json({ error: 'packages array required' });
    const created = await prisma.mailroomPackage.createMany({ data: packages });
    res.status(201).json({ count: created.count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
