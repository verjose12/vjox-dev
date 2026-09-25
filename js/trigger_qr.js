/* =====================================================
   VJOX — QR PROMOCIONAL
   Archivo: trigger_qr.js
===================================================== */

/* =========================
   CREAR MODAL
========================= */

function createQrPromoModal() {
  // Evita crear el modal más de una vez
  if (document.querySelector("#qrPromoModal")) {
    return;
  }

  const modal = document.createElement("div");

  modal.id = "qrPromoModal";
  modal.className = "qr-promo-modal";

  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div
      class="qr-promo-modal__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qrPromoTitle"
    >

      <!-- HEADER -->
      <div class="qr-promo-modal__header">

        <div>
          <span class="qr-promo-modal__eyebrow">
            QR PROMOCIONAL
          </span>

          <h2 id="qrPromoTitle">
            Lleva tu catálogo a más personas
          </h2>
        </div>

        <button
          id="closeQrPromoBtn"
          class="qr-promo-modal__close"
          type="button"
          aria-label="Cerrar"
        >
          <i class="bi bi-x-lg"></i>
        </button>

      </div>


      <!-- DESCRIPCIÓN -->
      <p class="qr-promo-modal__description">
        Comparte este código para que tus clientes
        descubran tus productos en VJOX.
      </p>


      <!-- QR -->
      <div class="qr-promo-preview">

        <div
          id="qrPromoCode"
          class="qr-promo-preview__code"
        >
          <i class="bi bi-qr-code"></i>
        </div>

        <div class="qr-promo-preview__status">
          <i class="bi bi-check-circle-fill"></i>

          <div>
            <strong>QR permanente</strong>
            <span>Vinculado a tu catálogo</span>
          </div>
        </div>

      </div>


      <!-- ACCIÓN PRINCIPAL -->
      <button
        id="downloadQrPromoBtn"
        class="qr-promo-download"
        type="button"
        disabled
      >
        <i class="bi bi-download"></i>
        Descargar para imprimir
      </button>


      <!-- ACCIONES SECUNDARIAS -->
      <div class="qr-promo-actions">

        <button
          id="shareQrPromoBtn"
          type="button"
          disabled
        >
          <i class="bi bi-share"></i>
          Compartir
        </button>

        <button
          id="copyQrPromoBtn"
          type="button"
          disabled
        >
          <i class="bi bi-link-45deg"></i>
          Copiar link
        </button>

      </div>


      <!-- DESTINO -->
      <div class="qr-promo-destination">

        <span>Destino del QR</span>

        <strong>
          <i class="bi bi-grid"></i>
          Tu catálogo VJOX
        </strong>

      </div>


      <!-- INFO -->
      <div class="qr-promo-info">
        <i class="bi bi-info-circle"></i>

        <span>
          Puedes actualizar tus productos, precios y stock
          sin cambiar este QR.
        </span>
      </div>


      <!-- MENSAJES -->
      <p
        id="qrPromoMessage"
        class="qr-promo-message"
        aria-live="polite"
      ></p>

    </div>
  `;

  document.body.appendChild(modal);
}

/* =========================
   ABRIR / CERRAR
========================= */

function openQrPromoModal() {
  const modal = document.querySelector("#qrPromoModal");

  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeQrPromoModal() {
  const modal = document.querySelector("#qrPromoModal");

  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

/* =========================
   URL PERMANENTE
========================= */

async function buildPermanentQrUrl() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("No hay un usuario autenticado.");
  }

  const qrUrl = new URL("viewer_qr.html", window.location.href);

  qrUrl.searchParams.set("user", user.id);

  return qrUrl.toString();
}

/* =========================
   GENERAR QR
========================= */

function generateQrCode(qrUrl) {
  const container = document.querySelector("#qrPromoCode");

  if (!container) {
    console.warn("VJOX QR: no se encontró el contenedor del QR.");
    return;
  }

  // Limpia el icono provisional o un QR anterior
  container.innerHTML = "";

  new QRCode(container, {
    text: qrUrl,
    width: 180,
    height: 180,
    colorDark: "#0f0f10",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

let currentQrUrl = "";

function showQrFallback(message, url = "") {
  const messageElement = document.querySelector("#qrPromoMessage");

  if (!messageElement) return;

  messageElement.innerHTML = "";

  const text = document.createElement("span");
  text.textContent = message;

  messageElement.appendChild(text);

  if (url) {
    const urlElement = document.createElement("input");

    urlElement.type = "text";
    urlElement.value = url;
    urlElement.readOnly = true;
    urlElement.className = "qr-promo-fallback-link";

    urlElement.addEventListener("click", () => {
      urlElement.select();
    });

    messageElement.appendChild(urlElement);
  }
}

function getQrImageSource() {
  const container = document.querySelector("#qrPromoCode");

  if (!container) return null;

  const canvas = container.querySelector("canvas");

  if (canvas) {
    return canvas.toDataURL("image/png");
  }

  const image = container.querySelector("img");

  if (image) {
    return image.src;
  }

  return null;
}

async function createPrintableQrPoster() {
  const qrSource = getQrImageSource();

  if (!qrSource) {
    throw new Error("No se encontró el QR para imprimir.");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  /*
    1200 x 1600 px
    Relación 3:4.
    Suficiente para nuestra primera impresión.
  */
  canvas.width = 1200;
  canvas.height = 1600;

  // =========================
  // FONDO
  // =========================

  ctx.fillStyle = "#0f0f10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // =========================
  // MARCA VJOX
  // =========================

  ctx.textAlign = "center";

  ctx.fillStyle = "#22c55e";
  ctx.font = "800 92px system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.fillText("VJOX", canvas.width / 2, 170);

  // =========================
  // GANCHO
  // =========================

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 64px system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.fillText("¿Vienes aburrido?", canvas.width / 2, 300);

  // =========================
  // DESCRIPCIÓN
  // =========================

  ctx.fillStyle = "#8a8f98";
  ctx.font = "500 42px system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.fillText("Mira productos y ofertas", canvas.width / 2, 390);

  ctx.fillText("durante tu viaje", canvas.width / 2, 445);

  // =========================
  // QR
  // =========================

  const qrImage = new Image();

  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrSource;
  });

  // Fondo blanco / quiet zone
  ctx.fillStyle = "#ffffff";

  ctx.beginPath();
  ctx.roundRect(285, 535, 630, 630, 36);
  ctx.fill();

  ctx.drawImage(qrImage, 335, 585, 530, 530);

  // =========================
  // CTA
  // =========================

  ctx.fillStyle = "#22c55e";
  ctx.font = "800 54px system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.fillText("ESCANEA AQUÍ", canvas.width / 2, 1270);

  // =========================
  // FOOTER
  // =========================

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 34px system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.fillText("Catálogo actualizado", canvas.width / 2, 1360);

  ctx.fillStyle = "#8a8f98";
  ctx.font = "400 27px system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.fillText(
    "Productos, precios y disponibilidad pueden cambiar",
    canvas.width / 2,
    1430,
  );

  return canvas;
}

/* =========================
   INICIALIZAR
========================= */

document.addEventListener("DOMContentLoaded", () => {
  createQrPromoModal();

  const openBtn = document.querySelector("#openQrPromoBtn");

  const closeBtn = document.querySelector("#closeQrPromoBtn");

  const modal = document.querySelector("#qrPromoModal");

  const copyBtn = document.querySelector("#copyQrPromoBtn");

  const shareBtn = document.querySelector("#shareQrPromoBtn");

  const downloadBtn = document.querySelector("#downloadQrPromoBtn");

  if (!openBtn) {
    console.warn("VJOX QR: no se encontró el botón QR promocional.");

    return;
  }

  openBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    openQrPromoModal();

    try {
      const qrUrl = await buildPermanentQrUrl();

      console.log("VJOX QR — enlace permanente:", qrUrl);

      generateQrCode(qrUrl);

      currentQrUrl = qrUrl;

      if (copyBtn) copyBtn.disabled = false;
      if (shareBtn) shareBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
    } catch (error) {
      console.error("VJOX QR:", error);
    }
  });

  closeBtn?.addEventListener("click", closeQrPromoModal);

  // Cerrar tocando fuera del panel
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeQrPromoModal();
    }
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("show")) {
      closeQrPromoModal();
    }
  });

  /* =========================
   COPIAR LINK
========================= */

  copyBtn?.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API no disponible.");
      }

      await navigator.clipboard.writeText(currentQrUrl);

      copyBtn.innerHTML = `
      <i class="bi bi-check-lg"></i>
      Copiado
    `;

      const messageElement = document.querySelector("#qrPromoMessage");

      if (messageElement) {
        messageElement.innerHTML = "";
      }

      setTimeout(() => {
        copyBtn.innerHTML = `
        <i class="bi bi-link-45deg"></i>
        Copiar link
      `;
      }, 1800);
    } catch (error) {
      console.warn("VJOX QR: copia automática no disponible.", error);

      showQrFallback(
        "No pudimos copiar automáticamente. Mantén presionado el enlace:",
        currentQrUrl,
      );
    }
  });

  /* =========================
   COMPARTIR
========================= */
  shareBtn?.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    const shareData = {
      title: "Mi catálogo VJOX",
      text: "Explora mis productos disponibles en VJOX.",
      url: currentQrUrl,
    };

    try {
      // Opción ideal en celular
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      // Segundo intento: copiar
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentQrUrl);

        showQrFallback(
          "Tu navegador no permite compartir directamente. El enlace fue copiado.",
        );

        return;
      }

      // Última opción
      showQrFallback("Comparte este enlace:", currentQrUrl);
    } catch (error) {
      // Si el usuario simplemente cerró
      // el menú de compartir, no mostramos error.
      if (error.name === "AbortError") {
        return;
      }

      console.warn("VJOX QR: compartir no disponible.", error);

      showQrFallback(
        "No pudimos abrir las opciones para compartir. Usa este enlace:",
        currentQrUrl,
      );
    }
  });
  downloadBtn?.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    try {
      const poster = await createPrintableQrPoster();

      const link = document.createElement("a");

      link.download = "vjox-qr-promocional.png";

      link.href = poster.toDataURL("image/png");

      link.click();
    } catch (error) {
      console.error("VJOX QR: no se pudo generar el cartel.", error);

      showQrFallback("No pudimos generar la imagen para imprimir.");
    }
  });
});
