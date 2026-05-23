/**
 * Server action access:
 * - ADMIN (requireAdminSession): CRM, projects, email, stats, unlock/delete
 * - PUBLIC: approveProjectAction (client signing on /p/[id])
 * - PUBLIC: createPaymongoLinkAction (client checkout on /p/[id])
 */

export {
  getClients,
  updateClientStatusAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
  getClientById,
} from "./clients";

export {
  getSavedProjects,
  updateProjectStatusAction,
  saveProjectAction,
  approveProjectAction,
  deleteProjectAction,
  unlockProjectAction,
} from "./projects";

export { createPaymongoLinkAction } from "./billing";

export { getStats } from "./stats";

export { getActivityLogsAction } from "./activity";

export {
  getEmailTemplates,
  saveEmailTemplate,
  sendIndividualEmailAction,
  getBulkEmailRecipientCountAction,
  sendBulkEmailAction,
} from "./email";
