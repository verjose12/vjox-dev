// ============================================================
// VJOX - SUBSCRIPTION
// Pantalla de renovación de suscripción
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const planName = document.querySelector("#planName");
  const planPrice = document.querySelector("#planPrice");

  const renewBtn = document.querySelector("#renewSubscriptionBtn");
  const logoutBtn = document.querySelector("#logoutBtn");

  // ----------------------------------------------------------
  // Obtener usuario actual
  // ----------------------------------------------------------

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    window.location.replace("./auth/login.html");
    return;
  }

  // ----------------------------------------------------------
  // Obtener perfil
  // ----------------------------------------------------------

  const profile = await getProfile(user.id);

  if (!profile) {
    window.location.replace("./profiles-setup.html");
    return;
  }

  // ----------------------------------------------------------
  // Mostrar plan
  // ----------------------------------------------------------

  if (profile.business_type === "real_estate") {
    planName.textContent = "VJOX Inmobiliario";
    planPrice.textContent = "$800";
  } else {
    planName.textContent = "VJOX Productos";
    planPrice.textContent = "$350";
  }

  // ----------------------------------------------------------
  // Renovar
  // ----------------------------------------------------------

  renewBtn.addEventListener("click", () => {
    const phone = "526565792009";

    const plan =
      profile.business_type === "real_estate"
        ? "VJOX Inmobiliario ($800 MXN/mes)"
        : "VJOX Productos ($350 MXN/mes)";

    const message =
      `Hola, quiero renovar mi suscripción de ${plan}.\n\n` +
      `Negocio: ${profile.business_name}\n` +
      `Cuenta: ${user.email}`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  });

  // ----------------------------------------------------------
  // Cerrar sesión
  // ----------------------------------------------------------

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = "Cerrando sesión...";

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Error cerrando sesión:", error);

      logoutBtn.disabled = false;
      logoutBtn.textContent = "Cerrar sesión";
      return;
    }

    window.location.replace("./auth/login.html");
  });
});
