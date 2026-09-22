import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FIRST_TIME_PASSWORD = "@scaui";

interface ActivateInput {
  email: string;
  password: string;
}

/**
 * First-time activation for members already on the SCAUI roster.
 * The shared starter password is "scaui"; the account is created on the fly
 * and flagged so the member must set their own password right after.
 */
export const activateAccount = createServerFn({ method: "POST" })
  .inputValidator((data: ActivateInput) => ({
    email: String(data.email ?? "").trim().toLowerCase(),
    password: String(data.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@")) {
      return { ok: false as const, error: "Enter a valid email address." };
    }
    if (data.password !== FIRST_TIME_PASSWORD) {
      return {
        ok: false as const,
        error: "That is not the first-time password. Use @scaui to activate your account.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: record } = await supabaseAdmin
      .from("member_records")
      .select("*")
      .eq("email", data.email)
      .maybeSingle();

    if (!record) {
      return {
        ok: false as const,
        error: "We could not find that email on the SCAUI member list. Join SCAUI first.",
      };
    }
    if (record.claimed) {
      return {
        ok: false as const,
        error: "This account is already active. Sign in with your own password.",
      };
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: FIRST_TIME_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: record.full_name },
    });

    if (createError || !created.user) {
      return {
        ok: false as const,
        error: createError?.message ?? "We could not create your account. Try again.",
      };
    }

    const userId = created.user.id;

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: data.email,
      full_name: record.full_name,
      phone: record.phone,
      birthday: record.birthday,
      gender: record.gender,
      faculty: record.faculty,
      department: record.department,
      level: record.level,
      interests: record.interests,
      current_track: record.current_track,
      expectations: record.expectations,
      willing_to_volunteer: record.willing_to_volunteer,
      must_change_password: true,
    });

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    const role = (count ?? 0) === 0 ? "super_admin" : "member";
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
    if (role === "super_admin") {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "member" });
    }

    await supabaseAdmin
      .from("member_records")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq("id", record.id);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      actor_email: data.email,
      action: "account.activated",
      entity: "profiles",
      entity_id: userId,
      details: { granted_role: role },
    });

    return { ok: true as const, role };
  });

interface JoinInput {
  email: string;
  full_name: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  faculty?: string;
  department?: string;
  level?: string;
  interests?: string[];
  expectations?: string;
  willing_to_volunteer?: boolean;
  preferred_team?: string;
}

/** Public "Join SCAUI" form. Adds the person to the member roster. */
export const joinScaui = createServerFn({ method: "POST" })
  .inputValidator((data: JoinInput) => data)
  .handler(async ({ data }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    const fullName = String(data.full_name ?? "").trim();
    if (!email.includes("@") || fullName.length < 2) {
      return { ok: false as const, error: "Please enter your full name and a valid email." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("member_records")
      .select("id, claimed")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return {
        ok: false as const,
        error: existing.claimed
          ? "You are already a member — just sign in."
          : "You are already on the list. Activate your account with the password scaui.",
      };
    }

    const { error } = await supabaseAdmin.from("member_records").insert({
      email,
      full_name: fullName,
      phone: data.phone ?? null,
      birthday: data.birthday && data.birthday.length === 10 ? data.birthday : null,
      gender: data.gender ?? null,
      faculty: data.faculty ?? null,
      department: data.department ?? null,
      level: data.level ?? null,
      interests: data.interests ?? [],
      expectations: data.expectations ?? null,
      willing_to_volunteer: data.willing_to_volunteer ?? false,
      preferred_team: data.preferred_team ?? null,
    });

    if (error) return { ok: false as const, error: "Something went wrong. Please try again." };

    await supabaseAdmin.from("newsletter_subscribers").upsert(
      { email, name: fullName, segment: "members" },
      { onConflict: "email" },
    );

    return { ok: true as const };
  });

interface RoleInput {
  user_id: string;
  role: "super_admin" | "admin" | "team_lead" | "member";
  action: "grant" | "revoke";
}

/** Super admins manage who else is an administrator or team lead. */
export const manageRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: RoleInput) => data)
  .handler(async ({ data, context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) return { ok: false as const, error: "Only super admins can change roles." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.action === "grant") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: `role.${data.action}`,
      entity: "user_roles",
      entity_id: data.user_id,
      details: { role: data.role },
    });

    return { ok: true as const };
  });

/** Admin bulk import of members from a pasted CSV-style list. */
export const importMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { rows: JoinInput[] }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin && !isSuper) return { ok: false as const, error: "Not allowed.", imported: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rows = (data.rows ?? [])
      .map((r) => ({
        email: String(r.email ?? "").trim().toLowerCase(),
        full_name: String(r.full_name ?? "").trim(),
        phone: r.phone ?? null,
        birthday: r.birthday && r.birthday.length === 10 ? r.birthday : null,
        faculty: r.faculty ?? null,
        department: r.department ?? null,
        level: r.level ?? null,
        interests: r.interests ?? [],
        preferred_team: r.preferred_team ?? null,
      }))
      .filter((r) => r.email.includes("@") && r.full_name.length > 1);

    if (rows.length === 0) return { ok: false as const, error: "No valid rows found.", imported: 0 };

    const { error } = await supabaseAdmin.from("member_records").upsert(rows, { onConflict: "email" });
    if (error) return { ok: false as const, error: error.message, imported: 0 };

    return { ok: true as const, imported: rows.length };
  });
