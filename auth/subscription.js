// ============================================================
// VJOX - SUBSCRIPTION
// Pantalla de renovación de suscripción
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const planName = document.querySelector("#planName");
  const planPrice = document.querySelector("#planPrice");

  const renewBtn = document.querySelector("#renewSubscriptionBtn");
  const logoutBtn = document.querySelector("#logoutBtn");

  const benefitsBtn = document.querySelector("#viewSubscriptionBenefitsBtn");
  const benefitsModal = document.querySelector("#subscriptionBenefitsModal");
  const closeBenefitsBtn = document.querySelector(
    "#closeSubscriptionBenefitsBtn",
  );
  const acceptBenefitsBtn = document.querySelector(
    "#acceptSubscriptionBenefitsBtn",
  );
  const benefitsPanel = benefitsModal?.querySelector(
    ".subscription-modal__panel",
  );

  function openBenefitsModal() {
    if (!benefitsModal) return;

    benefitsModal.classList.add("show");
    benefitsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    benefitsPanel?.focus();
  }

  function closeBenefitsModal() {
    if (!benefitsModal) return;

    benefitsModal.classList.remove("show");
    benefitsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    benefitsBtn?.focus();
  }

  benefitsBtn?.addEventListener("click", openBenefitsModal);
  closeBenefitsBtn?.addEventListener("click", closeBenefitsModal);
  acceptBenefitsBtn?.addEventListener("click", closeBenefitsModal);

  benefitsModal?.addEventListener("click", (event) => {
    if (event.target === benefitsModal) {
      closeBenefitsModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && benefitsModal?.classList.contains("show")) {
      closeBenefitsModal();
    }
  });

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

  const isRealEstate = profile.business_type === "real_estate";
  const isFounder = profile.is_founder === true;
  const PROMOTION_END = new Date("2027-01-01T06:00:00Z");
  const promotionActive = new Date() < PROMOTION_END;

  let plan;
  let price;

  if (isRealEstate) {
    plan = "VJOX Inmobiliario";
    price = 799.99;
  } else {
    plan = "VJOX Productos";

    if (promotionActive) {
      price = 49.99;
    } else if (isFounder) {
      price = 150;
    } else {
      price = 350;
    }
  }

  planName.textContent = plan;
  planPrice.textContent = `$${price.toFixed(2)}`;

  const benefitsContent = document.querySelector(
    "#subscriptionBenefitsContent",
  );

  if (benefitsContent) {
    const benefits = isRealEstate
      ? [
          "Registro y administración de propiedades",
          "Galería digital de propiedades",
          "Publicación de propiedades en venta y renta",
          "Compartir propiedades por WhatsApp",
          "Acceso a nuevas mejoras del módulo inmobiliario",
        ]
      : [
          "Registro y administración de productos",
          "Galería y catálogo digital",
          "Compartir por WhatsApp",
          "Código QR promocional",
          "Acceso a nuevas mejoras del módulo de productos",
        ];

    const benefitsList = benefits.map((item) => `<li>${item}</li>`).join("");

    let conditions = "";

    if (isRealEstate) {
      conditions = `
      <p><strong>Precio mensual:</strong> $${price.toFixed(2)} MXN.</p>
      <p>Incluye 10 días de prueba gratuita desde el registro.</p>
    `;
    } else {
      conditions = `
      ${
        isFounder
          ? '<p class="subscription-founder-label">✓ Tienes el beneficio de fundador</p>'
          : "<p>Tu cuenta pertenece al plan general de VJOX Productos.</p>"
      }

        <p>
          <strong>Tu tarifa mensual actual:</strong>
          $${price.toFixed(2)} MXN.
        </p>

      <p><strong>Precio promocional:</strong> $49.99 MXN mensuales durante octubre, noviembre y diciembre de 2026.</p>

      <p><strong>Desde enero de 2027:</strong> $150 MXN mensuales para fundadores que conserven el beneficio y $350 MXN mensuales para usuarios generales.</p>

      <p>Incluye 10 días de prueba gratuita desde el registro.</p>

      <p class="subscription-benefits-note">
        La publicación directa en Facebook estará disponible cuando Meta apruebe la integración. No forma parte de las funciones actualmente garantizadas.
      </p>
    `;
    }

    benefitsContent.innerHTML = `
    <h3>${isRealEstate ? "VJOX Inmobiliario" : "VJOX Productos"}</h3>

    <p><strong>Tu suscripción incluye:</strong></p>

    <ul class="subscription-benefits-list">
      ${benefitsList}
    </ul>

    <hr class="subscription-benefits-divider">

    <h3>Condiciones comerciales</h3>

    ${conditions}
  `;
  }

  // ----------------------------------------------------------
  // Renovar
  // ----------------------------------------------------------

  renewBtn.addEventListener("click", () => {
    const phone = "526565792009";

    const message =
      `Hola, quiero renovar mi suscripción de ${plan} ($${price.toFixed(2)} MXN/mes).\n\n` +
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
