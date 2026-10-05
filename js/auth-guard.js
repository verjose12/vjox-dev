// ============================================================
// VJOX - AUTH & SUBSCRIPTION GUARD
// Protege páginas privadas y valida la suscripción
// ============================================================

async function requireAuth() {
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  // ----------------------------------------------------------
  // 1. Validar sesión
  // ----------------------------------------------------------

  if (userError || !user) {
    const loginUrl =
      document.body.dataset.loginUrl || "./auth/login.html";

    window.location.replace(loginUrl);
    return null;
  }

  // ----------------------------------------------------------
  // 2. Obtener perfil
  // ----------------------------------------------------------

  const profile = await getProfile(user.id);

  // Si todavía no existe perfil, dejamos que el flujo
  // de configuración se encargue.
  if (!profile) {
    return user;
  }

  // ----------------------------------------------------------
  // 3. Usuarios beta
  // ----------------------------------------------------------

  if (profile.plan === "beta") {
    return user;
  }

  // ----------------------------------------------------------
  // 4. Validar prueba gratuita
  // ----------------------------------------------------------

  const now = new Date();

  const trialEndsAt = profile.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : null;

  const subscriptionEndsAt = profile.subscription_ends_at
    ? new Date(profile.subscription_ends_at)
    : null;

  const trialActive =
    trialEndsAt && trialEndsAt > now;

  const subscriptionActive =
    subscriptionEndsAt && subscriptionEndsAt > now;

  // ----------------------------------------------------------
  // 5. Tiene acceso
  // ----------------------------------------------------------

  if (trialActive || subscriptionActive) {
    return user;
  }

  // ----------------------------------------------------------
  // 6. Prueba y suscripción vencidas
  // ----------------------------------------------------------

  const isRealEstate =
    window.location.pathname.includes("/real-estate/");

  const subscriptionUrl = isRealEstate
    ? "../subscription.html"
    : "./subscription.html";

  window.location.replace(subscriptionUrl);

  return null;
}

// ============================================================
// VALIDACIÓN INICIAL
// ============================================================

requireAuth();

// ============================================================
// VOLVER A VALIDAR AL REGRESAR A LA PÁGINA
// ============================================================

window.addEventListener("pageshow", async () => {
  await requireAuth();
});