function getQRUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function buildCatalogEntryLink(productId, userId) {
  const url = new URL("viewer.html", window.location.href);

  url.searchParams.set("id", productId);
  url.searchParams.set("user", userId);
  url.searchParams.set("v", "2");
  // url.searchParams.set("source", "qr");

  const params = new URLSearchParams(window.location.search);
  const source = params.get("source") || "direct";

  url.searchParams.set("source", source);

  return url.toString();
}

function setQRMessage(message, isError = false) {
  const messageElement = document.querySelector("#qrMessage");

  if (!messageElement) return;

  messageElement.textContent = message;

  messageElement.style.color = isError
    ? "var(--color-danger)"
    : "var(--color-text-muted)";
}

function updateQRLanding(businessType) {
  const isRealEstate = businessType === "real_estate";

  const eyebrow = document.querySelector("#qrEyebrow");
  const title = document.querySelector("#qrTitle");
  const description = document.querySelector("#qrDescription");
  const button = document.querySelector("#openCatalogBtn");

  if (eyebrow) {
    eyebrow.textContent = isRealEstate
      ? "ENCUENTRA TU PRÓXIMO HOGAR"
      : "DESCUBRE ALGO NUEVO";
  }

  if (title) {
    title.textContent = isRealEstate
      ? "Tu próximo hogar podría estar aquí"
      : "Productos que podrían interesarte";
  }

  if (description) {
    description.textContent = isRealEstate
      ? "Explora las propiedades disponibles en este catálogo y contacta directamente al asesor inmobiliario para recibir más información."
      : "Explora el catálogo, descubre productos disponibles y contacta directamente al vendedor.";
  }

  if (button) {
    button.innerHTML = isRealEstate
      ? 'Explorar propiedades <span aria-hidden="true">→</span>'
      : 'Ver catálogo <span aria-hidden="true">→</span>';
  }

  document.title = isRealEstate
    ? "Descubre propiedades | VJOX"
    : "Descubre productos | VJOX";
}

async function initQRViewer() {
  const openCatalogBtn = document.querySelector("#openCatalogBtn");

  const userId = getQRUserId();

  // Por seguridad, el botón empieza deshabilitado
  openCatalogBtn.disabled = true;

  setQRMessage("Preparando catálogo...");

  // 1. El QR debe contener un usuario
  if (!userId) {
    setQRMessage("Este enlace no contiene un catálogo válido.", true);
    return;
  }

  // await trackQrScan(userId);

  const params = new URLSearchParams(window.location.search);
  const source = params.get("source");

  if (source === "qr") {
    await trackQrScan(userId);
  }

  try {
    // 2. Comprobar que el perfil público exista
    const sellerProfile = await getPublicProfile(userId);

    if (!sellerProfile) {
      setQRMessage("Este catálogo ya no está disponible.", true);
      return;
    }

    // Identificar el giro del negocio
    const businessType = sellerProfile.business_type || "products";

    const isRealEstate = businessType === "real_estate";

    console.log("VJOX — Giro del catálogo:", businessType);

    updateQRLanding(businessType);

    // 3. Buscar los productos actuales del vendedor
    // const products = await getProductsByUser(userId);

    // if (!products || products.length === 0) {
    //   setQRMessage(
    //     "Este catálogo no tiene productos disponibles por el momento.",
    //   );
    //   return;
    // }

    // // 4. Elegimos un producto ACTUAL como entrada
    // const entryProduct = products[0];

    // // 5. Construimos el enlace usando el flujo
    // //    que viewer.html ya entiende
    // const catalogUrl = buildCatalogEntryLink(entryProduct.id, userId);

    let catalogUrl;

    if (isRealEstate) {
      // Catálogo inmobiliario
      const properties = await getPublicAvailableProperties(userId);

      if (!properties || properties.length === 0) {
        setQRMessage(
          "Este catálogo no tiene propiedades disponibles por el momento.",
        );
        return;
      }

      const entryProperty = properties[0];

      const url = new URL("real-estate/property.html", window.location.href);
      url.searchParams.set("id", entryProperty.id);

      catalogUrl = url.toString();
    } else {
      // Catálogo de productos: conservamos su funcionamiento actual
      const products = await getProductsByUser(userId);

      if (!products || products.length === 0) {
        setQRMessage(
          "Este catálogo no tiene productos disponibles por el momento.",
        );
        return;
      }

      const entryProduct = products[0];
      catalogUrl = buildCatalogEntryLink(entryProduct.id, userId);
    }

    // 6. Ya podemos permitir entrar
    openCatalogBtn.disabled = false;
    setQRMessage("");

    const catalogStatus = document.querySelector("#qrCatalogStatus");

    if (catalogStatus) {
      catalogStatus.hidden = false;
    }

    // openCatalogBtn.addEventListener("click", () => {
    //   window.location.href = catalogUrl;
    // });

    openCatalogBtn.addEventListener("click", async () => {
      await trackCatalogEntry(userId, source || "direct");

      window.location.href = catalogUrl;
    });
  } catch (error) {
    console.error("Error preparando catálogo QR:", error);

    setQRMessage("No pudimos cargar este catálogo. Intenta nuevamente.", true);
  }
}

async function trackQrScan(userId) {
  const { error } = await supabaseClient.from("analytics_events").insert({
    user_id: userId,
    event_type: "qr_scan",
    product_id: null,
    source: "qr",
  });

  if (error) {
    console.error("Error registrando escaneo QR:", error);
  }
}

async function trackCatalogEntry(userId, source) {
  const { error } = await supabaseClient.from("analytics_events").insert({
    user_id: userId,
    event_type: "catalog_entry",
    product_id: null,
    source: source,
  });

  if (error) {
    console.error("Error registrando entrada al catálogo:", error);
  }
}

initQRViewer();
