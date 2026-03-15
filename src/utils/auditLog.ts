import { supabase } from "@/utils/supabase";

export type AuditAction =
  | "role_change"
  | "verify_toggle"
  | "job_deactivate"
  | "job_delete"
  | "report_review"
  | "report_dismiss"
  | "user_ban"
  | "subscription_change";

export interface AuditEntry {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: AuditAction;
  target_type: "user" | "job" | "report" | "subscription";
  target_id: string;
  details: string;
  created_at: string;
}

export async function logAdminAction(
  adminId: string,
  action: AuditAction,
  targetType: "user" | "job" | "report" | "subscription",
  targetId: string,
  details: string
) {
  if (!supabase) return;
  try {
    await supabase.from("audit_log").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch {
    // Silent — don't break admin actions if logging fails
    console.error("Failed to write audit log");
  }
}
