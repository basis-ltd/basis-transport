import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuditController } from '../controllers/auditLog.controller';

const router = Router();
const auditController = new AuditController();

// FETCH AUDIT LOGS
router.get('/', authMiddleware, auditController.fetchAuditLogs);

// FETCH ENTITY HISTORY
router.get('/entity/:entityType/:entityId', authMiddleware, auditController.fetchEntityHistory);

export default router;
