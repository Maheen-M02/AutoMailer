import { Router, Request, Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = Router();

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields: email, password." });
  }

  try {
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authErr || !authData.session || !authData.user) {
      return res.status(400).json({ error: authErr?.message || "Invalid email or password." });
    }

    const token = authData.session.access_token;
    const userId = authData.user.id;

    // 2. Retrieve user profile details from profiles database table
    let { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      // Self-healing: if the trigger is missing or profile doesn't exist, create it cleanly!
      const { data: newProfile, error: createErr } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          name: "User",
          email: authData.user.email || email,
          role: "sender" // Safe default role
        })
        .select()
        .single();

      if (!createErr && newProfile) {
        profile = newProfile;
      } else {
        // Fallback default in-memory response if even database insert fails
        return res.json({
          token,
          user: {
            id: userId,
            email: authData.user.email,
            name: "User",
            role: "sender",
            smtpConfigured: false
          }
        });
      }
    }

    return res.json({
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        smtpConfigured: profile.smtp_configured,
        adminId: profile.admin_id
      }
    });
  } catch (err) {
    console.error("Auth login router error:", err);
    return res.status(500).json({ error: "Internal server error during authentication login." });
  }
});

// POST /auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, name, businessName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields: email, password, name." });
  }

  try {
    // 1. Sign up user with Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password
    });

    if (authErr || !authData.user) {
      return res.status(400).json({ error: authErr?.message || "Failed to create user account." });
    }

    const userId = authData.user.id;

    // 2. Create the business tenant
    const baseSlug = (businessName || `${name}'s Workspace`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug || 'workspace'}-${Math.random().toString(36).substring(2, 7)}`;

    const { data: business, error: businessErr } = await supabaseAdmin
      .from("businesses")
      .insert({
        name: businessName || `${name}'s Workspace`,
        slug: slug,
        plan: "free",
        status: "active"
      })
      .select()
      .single();

    if (businessErr || !business) {
      console.error("Signup: failed to create business:", businessErr);
      return res.status(500).json({ error: "Failed to initialize organization workspace." });
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
        permissions: {}
      })
      .select()
      .single();

    if (profileErr || !profile) {
      console.error("Signup: failed to create profile:", profileErr);
      // Clean up business since profile failed
      await supabaseAdmin.from("businesses").delete().eq("id", business.id);
      return res.status(500).json({ error: "Failed to initialize user profile." });
    }

    // 4. Create free subscription
    const { error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        business_id: business.id,
        plan: "free",
        status: "active",
        emails_limit: 500,
        ai_tokens_limit: 10000
      });

    if (subErr) {
      // Log subscription creation failure but don't fail the signup
      console.error("Signup: failed to create default subscription:", subErr);
    }

    // Return session token and user details if auto-logged in
    const token = authData.session?.access_token || null;

    return res.status(201).json({
      message: token ? "Registration successful." : "Registration successful. Please verify your email.",
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        smtpConfigured: profile.smtp_configured || false,
        adminId: profile.admin_id || null
      }
    });

  } catch (err) {
    console.error("Auth signup router error:", err);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

export default router;
