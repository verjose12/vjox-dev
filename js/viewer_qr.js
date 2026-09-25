function getQRUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}


function buildCatalogEntryLink(productId, userId) {
  const url = new URL("viewer.html", window.location.href);

  url.searchParams.set("id", productId);
  url.searchParams.set("user", userId);
  url.searchParams.set("v", "2");

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


async function initQRViewer() {
  const openCatalogBtn =
    document.querySelector("#openCatalogBtn");

  const userId = getQRUserId();

  // Por seguridad, el botón empieza deshabilitado
  openCatalogBtn.disabled = true;

  setQRMessage("Preparando catálogo...");

  // 1. El QR debe contener un usuario
  if (!userId) {
    setQRMessage(
      "Este enlace no contiene un catálogo válido.",
      true
    );
    return;
  }

  try {

    // 2. Comprobar que el perfil público exista
    const sellerProfile =
      await getPublicProfile(userId);

    if (!sellerProfile) {
      setQRMessage(
        "Este catálogo ya no está disponible.",
        true
      );
      return;
    }

    // 3. Buscar los productos actuales del vendedor
    const products =
      await getProductsByUser(userId);

    if (!products || products.length === 0) {
      setQRMessage(
        "Este catálogo no tiene productos disponibles por el momento."
      );
      return;
    }

    // 4. Elegimos un producto ACTUAL como entrada
    const entryProduct = products[0];

    // 5. Construimos el enlace usando el flujo
    //    que viewer.html ya entiende
    const catalogUrl =
      buildCatalogEntryLink(
        entryProduct.id,
        userId
      );

    // 6. Ya podemos permitir entrar
    openCatalogBtn.disabled = false;

    setQRMessage("");

    openCatalogBtn.addEventListener(
      "click",
      () => {
        window.location.href = catalogUrl;
      }
    );

  } catch (error) {

    console.error(
      "Error preparando catálogo QR:",
      error
    );

    setQRMessage(
      "No pudimos cargar este catálogo. Intenta nuevamente.",
      true
    );
  }
}


initQRViewer();