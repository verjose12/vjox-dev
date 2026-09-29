/* =====================================================
   VJOX — FACEBOOK
   Archivo: facebook.js
===================================================== */

let selectedFacebookProduct = null;
let selectedFacebookButton = null;

let currentFacebookConnection = null;

async function getFacebookConnection() {
  const { data, error } = await supabaseClient.functions.invoke(
    "facebook-connection-info",
  );

  if (error) {
    console.error("Error consultando conexión de Facebook:", error);

    return null;
  }

  return data;
}

function createFacebookModal() {
  if (document.querySelector("#facebookModal")) return;

  const modal = document.createElement("div");

  modal.id = "facebookModal";
  modal.className = "facebook-modal";
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="facebook-modal__panel">

      <div class="facebook-modal__header">
        <div>
          <span class="facebook-modal__eyebrow">
            FACEBOOK
          </span>

          <h2 id="facebookModalTitle">
            Facebook
          </h2>
        </div>

        <button
          id="closeFacebookModalBtn"
          class="facebook-modal__close"
          type="button"
          aria-label="Cerrar"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div id="facebookModalContent">
        <!-- Se genera dependiendo del estado -->
      </div>

    </div>
  `;

  document.body.appendChild(modal);
}

function openFacebookModal() {
  const modal = document.querySelector("#facebookModal");

  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeFacebookModal() {
  const modal = document.querySelector("#facebookModal");

  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

function renderFacebookConnection(connection) {
  const content = document.querySelector("#facebookModalContent");

  if (!content) return;

  if (connection?.connected) {
    const pageName = connection.page?.name || "Página de Facebook";

    content.innerHTML = `
      <div class="facebook-status facebook-status--connected">

        <div class="facebook-status__icon">
          <i class="bi bi-check-lg"></i>
        </div>

        <div>
          <span class="facebook-status__label">
            Facebook conectado
          </span>

          <h3>${pageName}</h3>

          <p>
            Esta es la página vinculada actualmente
            con tu cuenta de VJOX.
          </p>
        </div>

      </div>

      <button
        id="publishFacebookBtn"
        class="facebook-primary-btn"
        type="button"
      >
        <i class="bi bi-facebook"></i>
        Publicar en Facebook
      </button>

      <button
        id="manageFacebookBtn"
        class="facebook-secondary-btn"
        type="button"
      >
        Administrar conexión
      </button>
    `;

    return;
  }

  content.innerHTML = `
    <div class="facebook-status">

      <div class="facebook-status__icon">
        <i class="bi bi-facebook"></i>
      </div>

      <div>
        <span class="facebook-status__label">
          Facebook no conectado
        </span>

        <h3>Conecta tu página</h3>

        <p>
          Vincula una página de Facebook para
          publicar tus productos directamente
          desde VJOX.
        </p>
      </div>

    </div>

    <button
      id="connectFacebookBtn"
      class="facebook-primary-btn"
      type="button"
    >
      <i class="bi bi-facebook"></i>
      Conectar Facebook
    </button>

    <button
      id="cancelFacebookBtn"
      class="facebook-secondary-btn"
      type="button"
    >
      Ahora no
    </button>
  `;
}

async function handleFacebookCallback() {
  const params = new URLSearchParams(window.location.search);

  const facebookStatus = params.get("facebook");

  if (!facebookStatus) return;

  // Limpiamos ?facebook=... de la URL
  const cleanUrl = window.location.pathname;

  window.history.replaceState({}, document.title, cleanUrl);

  openFacebookModal();

  // Facebook conectado correctamente
  if (facebookStatus === "connected") {
    const connection = await getFacebookConnection();

    currentFacebookConnection = connection;

    renderFacebookConnection(connection);

    return;
  }

  // La cuenta no administra ninguna página
  if (facebookStatus === "no_pages") {
    renderFacebookNoPages();
    return;
  }

  // Lo manejaremos después
  //   if (facebookStatus === "select") {
  //     console.log("Facebook requiere seleccionar una página.");
  //   }
  if (facebookStatus === "select") {
    await loadPendingFacebookPages();
    return;
  }
}

function renderFacebookNoPages() {
  const content = document.querySelector("#facebookModalContent");

  if (!content) return;

  content.innerHTML = `
    <div class="facebook-status">

      <div class="facebook-status__icon">
        <i class="bi bi-facebook"></i>
      </div>

      <div>
        <span class="facebook-status__label">
          Página requerida
        </span>

        <h3>No encontramos una página</h3>

        <p>
          Tu cuenta de Facebook funciona,
          pero VJOX necesita una Página de Facebook
          para publicar tus productos.
        </p>
      </div>

    </div>

    <button
      id="createFacebookPageBtn"
      class="facebook-primary-btn"
      type="button"
    >
      <i class="bi bi-plus-circle"></i>
      Crear página en Facebook
    </button>

    <button
      id="retryFacebookBtn"
      class="facebook-secondary-btn"
      type="button"
    >
      Ya tengo una página · Intentar de nuevo
    </button>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  createFacebookModal();

  handleFacebookCallback();

  const facebookMenuBtn = document.querySelector("#facebookMenuBtn");

  facebookMenuBtn?.addEventListener("click", async (event) => {
    event.preventDefault();

    openFacebookModal();

    const connection = await getFacebookConnection();

    currentFacebookConnection = connection;

    console.log("Estado Facebook:", connection);

    renderFacebookConnection(connection);
  });

  document.addEventListener("click", async (event) => {
    const pageOption = event.target.closest(".facebook-page-option");

    if (pageOption) {
      const pageId = pageOption.dataset.pageId;

      await selectFacebookPage(pageId);

      return;
    }

    // PUBLICAR PRODUCTO EN FACEBOOK

    if (event.target.closest("#confirmPublishFacebookBtn")) {
      if (!selectedFacebookProduct || !selectedFacebookButton) {
        return;
      }

      await publishFacebookProduct(
        selectedFacebookProduct,
        selectedFacebookButton,
      );

      return;
    }

    // ADMINISTRAR FACEBOOK

    if (event.target.closest("#manageFacebookBtn")) {
      renderFacebookManagement(currentFacebookConnection);

      return;
    }

    // VOLVER

    if (event.target.closest("#backFacebookBtn")) {
      renderFacebookConnection(currentFacebookConnection);

      return;
    }

    // Conectar Facebook
    if (event.target.closest("#connectFacebookBtn")) {
      await connectFacebook();
      return;
    }

    // Desconectar Facebook

    if (event.target.closest("#disconnectFacebookBtn")) {
      await disconnectFacebook();
      return;
    }

    if (event.target.closest("#retryFacebookBtn")) {
      await connectFacebook();
      return;
    }

    // Cerrar modal
    if (
      event.target.closest("#closeFacebookModalBtn") ||
      event.target.closest("#cancelFacebookBtn")
    ) {
      closeFacebookModal();
    }
  });

  const modal = document.querySelector("#facebookModal");

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeFacebookModal();
    }
  });
});

async function connectFacebook() {
  const { data, error } = await supabaseClient.functions.invoke(
    "facebook-connect-start",
    {
      body: {
        returnTo: "index",
      },
    },
  );

  if (error) {
    console.error("Error iniciando conexión con Facebook:", error);

    alert("No se pudo iniciar la conexión con Facebook.");

    return;
  }

  if (!data?.url) {
    console.error("Facebook no devolvió una URL de autorización.", data);

    return;
  }

  window.location.href = data.url;
}

async function disconnectFacebook() {
  const confirmed = confirm(
    "¿Quieres desconectar tu página de Facebook de VJOX?",
  );

  if (!confirmed) return;

  const { data, error } = await supabaseClient.functions.invoke(
    "facebook-disconnect",
  );

  if (error) {
    console.error("Error desconectando Facebook:", error);

    alert("No se pudo desconectar Facebook.");

    return;
  }

  if (!data?.ok) {
    console.error("Facebook no pudo desconectarse:", data);

    alert("No se pudo desconectar Facebook.");

    return;
  }

  currentFacebookConnection = {
    ok: true,
    connected: false,
    page: null,
  };

  renderFacebookConnection(currentFacebookConnection);
}

function renderFacebookManagement(connection) {
  const content = document.querySelector("#facebookModalContent");

  if (!content) return;

  const pageName = connection?.page?.name || "Página de Facebook";

  content.innerHTML = `
    <div class="facebook-status facebook-status--connected">

      <div class="facebook-status__icon">
        <i class="bi bi-facebook"></i>
      </div>

      <div>
        <span class="facebook-status__label">
          Página conectada
        </span>

        <h3>${pageName}</h3>

        <p>
          Puedes desconectar esta página de VJOX
          y conectar otra posteriormente.
        </p>
      </div>

    </div>

    <button
      id="disconnectFacebookBtn"
      class="facebook-danger-btn"
      type="button"
    >
      <i class="bi bi-link-45deg"></i>
      Desconectar Facebook
    </button>

    <button
      id="backFacebookBtn"
      class="facebook-secondary-btn"
      type="button"
    >
      Volver
    </button>
  `;
}

async function loadPendingFacebookPages() {
  const { data, error } = await supabaseClient.functions.invoke(
    "facebook-connect-pending-pages",
  );

  if (error || !data?.ok) {
    console.error("Error obteniendo páginas de Facebook:", error || data);

    alert("No pudimos obtener tus páginas de Facebook.");

    return;
  }

  renderFacebookPageSelection(data.pages || []);
}

function renderFacebookPageSelection(pages) {
  const content = document.querySelector("#facebookModalContent");

  if (!content) return;

  const pageOptions = pages
    .map(
      (page) => `
        <button
          class="facebook-page-option"
          type="button"
          data-page-id="${page.page_id}"
        >
          <i class="bi bi-facebook"></i>

          <span>
            ${page.page_name}
          </span>

          <i class="bi bi-chevron-right"></i>
        </button>
      `,
    )
    .join("");

  content.innerHTML = `
    <div class="facebook-status">

      <div class="facebook-status__icon">
        <i class="bi bi-facebook"></i>
      </div>

      <div>
        <span class="facebook-status__label">
          Varias páginas encontradas
        </span>

        <h3>¿Cuál quieres conectar?</h3>

        <p>
          Selecciona la página que quieres utilizar
          para publicar desde VJOX.
        </p>
      </div>

    </div>

    <div class="facebook-page-list">
      ${pageOptions}
    </div>
  `;
}

async function selectFacebookPage(pageId) {
  if (!pageId) return;

  const { data, error } = await supabaseClient.functions.invoke(
    "facebook-connect-select-page",
    {
      body: {
        page_id: pageId,
      },
    },
  );

  if (error) {
    console.error("Error seleccionando página de Facebook:", error);

    alert("No pudimos conectar la página seleccionada.");

    return;
  }

  if (!data?.ok) {
    console.error("No se pudo conectar la página:", data);

    alert(data?.error || "No pudimos conectar la página seleccionada.");

    return;
  }

  // Consultamos nuevamente la conexión real
  const connection = await getFacebookConnection();

  currentFacebookConnection = connection;

  renderFacebookConnection(connection);
}

async function openFacebookForProduct(product, button) {
  selectedFacebookProduct = product;
  selectedFacebookButton = button;

  openFacebookModal();

  const connection = await getFacebookConnection();

  currentFacebookConnection = connection;

  if (!connection?.connected) {
    renderFacebookConnection(connection);
    return;
  }

  renderFacebookPublishProduct(product, connection);
}

function renderFacebookPublishProduct(product, connection) {
  const content = document.querySelector("#facebookModalContent");

  if (!content) return;

  const pageName = connection?.page?.name || "Página de Facebook";

  const imageUrl = product.urls?.[0] || "";

  //Calculamos precio

  const photoPrices = Array.isArray(product.perPhotoPrices)
    ? product.perPhotoPrices
        .map(Number)
        .filter((price) => Number.isFinite(price) && price > 0)
    : [];

  const uniquePrices = [...new Set(photoPrices)];

  let priceText = "Consulta precio";
  let priceNote = "Contacta al vendedor para conocer el precio.";

  if (uniquePrices.length > 1) {
    // Tiene diferentes precios por fotografía
    priceText = "Varios precios";
    priceNote = "Consulta cada opción en el catálogo.";
  } else if (uniquePrices.length === 1) {
    // Todas las fotografías tienen el mismo precio
    priceText = formatPrice(uniquePrices[0]);

    priceNote = "Todos los artículos de este producto tienen el mismo precio.";
  } else if (Number(product.price) > 0) {
    // Tiene un precio general
    priceText = formatPrice(product.price);

    priceNote = "Todos los artículos de este producto tienen el mismo precio.";
  }

  content.innerHTML = `
    <div class="facebook-status facebook-status--connected">

      <div class="facebook-status__icon">
        <i class="bi bi-facebook"></i>
      </div>

      <div>
        <span class="facebook-status__label">
          Publicar en Facebook
        </span>

        <h3>${pageName}</h3>

        <p>
          Este producto se publicará en tu
          página conectada.
        </p>
      </div>

    </div>

    <div class="facebook-product-preview">

      ${
        imageUrl
          ? `
            <img
              src="${imageUrl}"
              alt="${product.title}"
              class="facebook-product-preview__image"
            >
          `
          : ""
      }

      <div class="facebook-product-preview__info">

        <h3>
          ${product.title}
        </h3>

        <strong>
          ${priceText}
        </strong>

        ${
          priceNote
            ? `
      <span class="facebook-product-preview__price-note">
        ${priceNote}
      </span>
        `
            : ""
        }

        ${product.desc ? `<p>${product.desc}</p>` : ""}

      </div>

    </div>

    <button
      id="confirmPublishFacebookBtn"
      class="facebook-primary-btn"
      type="button"
    >
      <i class="bi bi-facebook"></i>
      Publicar en Facebook
    </button>

    <button
      id="cancelFacebookBtn"
      class="facebook-secondary-btn"
      type="button"
    >
      Cancelar
    </button>
  `;
}
