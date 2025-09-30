import { Router } from "express";
import * as controller from "./company.controller";
import {
  authenticateToken,
  requireSuperAdmin,
} from "../../middlewares/auth.middleware";

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Seuls les Super Admins peuvent créer, modifier, supprimer des companies
router.post("/", requireSuperAdmin, controller.createCompany);
router.put("/:id", requireSuperAdmin, controller.updateCompany);
router.delete("/:id", requireSuperAdmin, controller.deleteCompany);

// Tous les rôles authentifiés peuvent lire les companies
router.get("/", controller.listCompanies);
router.get("/:id", controller.getCompany);
router.get("/:id/admin", requireSuperAdmin, controller.getCompanyAdmin);

export default router;
