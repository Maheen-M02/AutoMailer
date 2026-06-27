/**
 * auth.service.ts — Authentication and profile self-healing service
 */

import { getSupabase, getSupabaseAdmin, getSupabaseAuth } from "../../config/supabase.js";
import { UnauthorizedError, BadRequestError } from "../../shared/errors.js";
import { logger } from "../../shared/logger.js";

interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    smtpConfigured: boolean;
    businessId?: string;
    adminId?: string;
  };
}

export class AuthService {
  /**
   * Performs user login via Supabase auth, validates profile,
   * and runs self-healing logic if profile is missing.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const supabase = getSupabaseAuth();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr || !authData.session || !authData.user) {
      logger.warn({ email, err: authErr?.message }, "Auth credentials rejection");
      throw new UnauthorizedError(authErr?.message || "Invalid email or password.");
    }

    const token = authData.session.access_token;
    const userId = authData.user.id;

    // 2. Fetch user profile
    let { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      logger.warn({ userId, email }, "Profile not found on login. Executing self-healing...");

      // Self-healing: create profile cleanly
      const { data: newProfile, error: createErr } = await getSupabaseAdmin()
        .from("profiles")
        .insert({
          id: userId,
          name: authData.user.user_metadata?.name || "User",
          email: authData.user.email || email,
          role: "sender", // Safe default role
          status: "active",
        })
        .select()
        .single();

      if (!createErr && newProfile) {
        profile = newProfile;
      } else {
        logger.error({ createErr, userId }, "Profile self-healing failed");
        // Fallback default in-memory response so user is not blocked
        return {
          token,
          user: {
            id: userId,
            email: authData.user.email || email,
            name: "User",
            role: "sender",
            smtpConfigured: false,
          },
        };
      }
    }

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        smtpConfigured: profile.smtp_configured || false,
        businessId: profile.business_id,
        adminId: profile.admin_id,
      },
    };
  }

  /**
   * Registers a new tenant organization and admin profile.
   */
  async signup(
    email: string,
    password: string,
    name: string,
    businessName?: string
  ): Promise<any> {
    const supabase = getSupabaseAuth();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr || !authData.user) {
      logger.error({ email, err: authErr?.message }, "Supabase signup failed");
      throw new BadRequestError(authErr?.message || "Failed to create user account.");
    }

    const userId = authData.user.id;

    // 2. Create the business tenant
    const baseSlug = (businessName || `${name}'s Workspace`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug || "workspace"}-${Math.random().toString(36).substring(2, 7)}`;

    const { data: business, error: businessErr } = await supabaseAdmin
      .from("businesses")
      .insert({
        name: businessName || `${name}'s Workspace`,
        slug: slug,
        plan: "free",
        status: "active",
      })
      .select()
      .single();

    if (businessErr || !business) {
      logger.error({ businessErr, userId }, "Signup: failed to create business");
      throw new BadRequestError("Failed to initialize organization workspace.");
    }

    // 3. Create the admin profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        business_id: business.id,
        email: email,
        name: name,
        role: "admin",
        status: "active",
        permissions: {},
      })
      .select()
      .single();

    if (profileErr || !profile) {
      logger.error({ profileErr, userId }, "Signup: failed to create profile");
      // Clean up business since profile failed
      await supabaseAdmin.from("businesses").delete().eq("id", business.id);
      throw new BadRequestError("Failed to initialize user profile.");
    }

    // 4. Create free subscription
    const { error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        business_id: business.id,
        plan: "free",
        status: "active",
        emails_limit: 500,
        ai_tokens_limit: 10000,
      });

    if (subErr) {
      logger.error({ subErr, businessId: business.id }, "Signup: failed to create free subscription");
    }

    const token = authData.session?.access_token || null;

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        smtpConfigured: profile.smtp_configured || false,
        businessId: profile.business_id,
        adminId: profile.admin_id,
      },
      message: token ? "Registration successful." : "Registration successful. Please verify your email.",
    };
  }

  /**
   * Log out a user session.
   */
  async logout(token: string): Promise<void> {
    const supabase = getSupabaseAuth();
    // In Supabase, signOut requires the client context.
    // If we have custom session management, we can invalidate it here.
    await supabase.auth.signOut();
  }
}

export const authService = new AuthService();
