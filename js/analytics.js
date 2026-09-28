/* =====================================================
   VJOX — ESTADÍSTICAS
   Archivo: analytics.js
===================================================== */

function createAnalyticsModal() {
  if (document.querySelector("#analyticsModal")) {
    return;
  }

  const modal = document.createElement("div");

  modal.id = "analyticsModal";
  modal.className = "analytics-modal";
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div
      class="analytics-modal__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyticsTitle"
    >
      <div class="analytics-modal__header">
        <div>
          <span class="analytics-modal__eyebrow">
            ESTADÍSTICAS
          </span>

          <h2 id="analyticsTitle">
            Actividad de tu catálogo
          </h2>
        </div>

        <button
          id="closeAnalyticsBtn"
          class="analytics-modal__close"
          type="button"
          aria-label="Cerrar"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="analytics-modal__content">

        <div class="analytics-stat">
          <span>Visitas al catálogo</span>
          <strong id="analyticsTotalViews">—</strong>
        </div>

        <div class="analytics-stat">
          <span>Escaneos QR</span>
          <strong id="analyticsQrScans">—</strong>
        </div>

        <div class="analytics-stat">
          <span>Visitas desde QR</span>
          <strong id="analyticsQrViews">—</strong>
        </div>

        <div class="analytics-stat">
          <span>Veces compartido</span>
          <strong id="analyticsShares">—</strong>
        </div>

        <div class="analytics-stat">
          <span>Visitas desde compartidos</span>
          <strong id="analyticsShareViews">—</strong>
        </div>

        <div class="analytics-stat">
          <span>Visitas directas</span>
          <strong id="analyticsDirectViews">—</strong>
        </div>

        <div class="analytics-stat analytics-stat--conversion">
            <span>Conversión del QR</span>
            <strong id="analyticsQrConversion">—</strong>
            <small>Escanearon y entraron al catálogo</small>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openAnalyticsModal() {
  const modal = document.querySelector("#analyticsModal");

  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeAnalyticsModal() {
  const modal = document.querySelector("#analyticsModal");

  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

async function loadAnalytics() {
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.error(
      "No se pudo obtener el usuario para estadísticas.",
      userError,
    );
    return;
  }

  const { data: events, error } = await supabaseClient
    .from("analytics_events")
    .select("event_type, source")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error cargando estadísticas:", error);
    return;
  }

  const totalViews = events.filter(
    (event) => event.event_type === "gallery_view",
  ).length;

  const qrScans = events.filter(
    (event) => event.event_type === "qr_scan",
  ).length;

  const qrViews = events.filter(
    (event) => event.event_type === "gallery_view" && event.source === "qr",
  ).length;

  const qrConversion = qrScans > 0 ? Math.round((qrViews / qrScans) * 100) : 0;

  const shares = events.filter(
    (event) => event.event_type === "share_click",
  ).length;

  const shareViews = events.filter(
    (event) => event.event_type === "gallery_view" && event.source === "share",
  ).length;

  const directViews = events.filter(
    (event) => event.event_type === "gallery_view" && event.source === "direct",
  ).length;

  document.querySelector("#analyticsTotalViews").textContent = totalViews;

  document.querySelector("#analyticsQrScans").textContent = qrScans;

  document.querySelector("#analyticsQrViews").textContent = qrViews;

  document.querySelector("#analyticsQrConversion").textContent =
    `${qrConversion}%`;

  document.querySelector("#analyticsShares").textContent = shares;

  document.querySelector("#analyticsShareViews").textContent = shareViews;

  document.querySelector("#analyticsDirectViews").textContent = directViews;
}

document.addEventListener("DOMContentLoaded", () => {
  createAnalyticsModal();

  const openBtn = document.querySelector("#openAnalyticsBtn");

  const closeBtn = document.querySelector("#closeAnalyticsBtn");

  const modal = document.querySelector("#analyticsModal");

  //   openBtn?.addEventListener("click", (event) => {
  //     event.preventDefault();

  //     openAnalyticsModal();
  //   });

  openBtn?.addEventListener("click", async (event) => {
    event.preventDefault();

    openAnalyticsModal();

    await loadAnalytics();
  });

  closeBtn?.addEventListener("click", closeAnalyticsModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeAnalyticsModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("show")) {
      closeAnalyticsModal();
    }
  });
});
