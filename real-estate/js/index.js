// ============================================================
// VJOX v4.6
// Inmobiliaria - Panel de propiedades
// ============================================================

const propertyList = document.querySelector("#propertyList");
const statusEl = document.querySelector("#status");
const searchInput = document.querySelector("#searchInput");

const deletePropertyModal = document.querySelector("#deletePropertyModal");
const deletePropertyName = document.querySelector("#deletePropertyName");
const closeDeletePropertyModal = document.querySelector(
  "#closeDeletePropertyModal",
);
const cancelDeletePropertyBtn = document.querySelector(
  "#cancelDeletePropertyBtn",
);
const confirmDeletePropertyBtn = document.querySelector(
  "#confirmDeletePropertyBtn",
);

let propertyPendingDelete = null;

const totalPropertiesEl = document.querySelector("#totalProperties");
const availablePropertiesEl = document.querySelector("#availableProperties");
const closedPropertiesEl = document.querySelector("#closedProperties");

let properties = [];

// ============================================================
// FILTROS DE PROPIEDADES
// ============================================================

const filterSaleBtn = document.querySelector("#filterSaleBtn");
const filterRentBtn = document.querySelector("#filterRentBtn");

let activePropertyFilter = null;

// Filtra las propiedades según su operación
function filterByOperation(items, operation) {
  if (!operation) return items;

  return items.filter(
    (property) =>
      property.operation_type === operation && property.status === "available",
  );
}

// Aplica el filtro activo y actualiza la lista
// Filtra las propiedades por texto
function filterBySearch(items, query) {
  if (!query) return items;

  return items.filter((property) => {
    const searchableText = [
      property.title,
      property.neighborhood,
      property.city,
      property.property_type,
      property.operation_type,
      property.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });
}

// Combina los filtros activos
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();

  const byOperation = filterByOperation(properties, activePropertyFilter);

  const filtered = filterBySearch(byOperation, query);

  renderProperties(filtered);

  statusEl.textContent =
    !filtered.length && properties.length
      ? "No se encontraron propiedades con estos filtros."
      : "";
}

// Activar o desactivar el filtro de Venta
// Actualiza visualmente los botones
function updateFilterButtons() {
  filterSaleBtn.setAttribute(
    "aria-pressed",
    String(activePropertyFilter === "sale"),
  );

  filterRentBtn.setAttribute(
    "aria-pressed",
    String(activePropertyFilter === "rent"),
  );
}

// Activa o desactiva un filtro
function togglePropertyFilter(operation) {
  activePropertyFilter = activePropertyFilter === operation ? null : operation;

  updateFilterButtons();
  applyFilters();
}

// Botón Venta
filterSaleBtn.addEventListener("click", () => {
  togglePropertyFilter("sale");
});

// Botón Renta
filterRentBtn.addEventListener("click", () => {
  togglePropertyFilter("rent");
});
// ============================================================
// INICIO
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadProperties();
});

// ============================================================
// CARGAR PROPIEDADES
// ============================================================

async function loadProperties() {
  statusEl.textContent = "Cargando propiedades...";

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    console.error("No se pudo obtener el usuario:", userError);

    statusEl.textContent = "No se pudo obtener la sesión.";
    return;
  }

  const { data, error } = await supabaseClient
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando propiedades:", error);

    statusEl.textContent = "No se pudieron cargar las propiedades.";
    return;
  }

  properties = data || [];

  updateSummary(properties);
  applyFilters();

  statusEl.textContent = properties.length
    ? ""
    : "Todavía no tienes propiedades registradas.";
}

// ============================================================
// MOSTRAR PROPIEDADES
// ============================================================

function renderProperties(items) {
  propertyList.innerHTML = "";

  if (!items.length) {
    return;
  }

  items.forEach((property) => {
    const card = createPropertyCard(property);

    propertyList.appendChild(card);
  });
}

// ============================================================
// CREAR TARJETA
// ============================================================

// function createPropertyCard(property) {
//   const card = document.createElement("article");

//   card.className = "card property-card";

//   const images = Array.isArray(property.image_urls)
//     ? property.image_urls
//     : [];

//   const mainImage = images[0] || "";

//   const price =
//     property.price !== null && property.price !== undefined
//       ? Number(property.price).toLocaleString("es-MX", {
//           style: "currency",
//           currency: "MXN",
//           maximumFractionDigits: 0,
//         })
//       : "Precio no disponible";

//   card.innerHTML = `
//     ${
//       mainImage
//         ? `
//           <img
//             src="${escapeHtml(mainImage)}"
//             alt="${escapeHtml(property.title || "Propiedad")}"
//             class="property-card__image"
//           >
//         `
//         : `
//           <div class="property-card__image-placeholder">
//             <i class="bi bi-house"></i>
//           </div>
//         `
//     }

//     <div class="property-card__body">

//       <span class="property-card__status">
//         ${getStatusLabel(property.status)}
//       </span>

//       <h3>
//         ${escapeHtml(property.title || "Sin título")}
//       </h3>

//       <strong class="property-card__price">
//         ${price}
//       </strong>

//       ${
//         property.location_text
//           ? `
//             <p class="property-card__location">
//               <i class="bi bi-geo-alt"></i>
//               ${escapeHtml(property.location_text)}
//             </p>
//           `
//           : ""
//       }

//     </div>
//   `;

//   return card;
// }

function createPropertyCard(property) {
  const card = document.createElement("article");

  // card.className = "property-card";
  card.className = "card property-card";

  const images = Array.isArray(property.image_urls) ? property.image_urls : [];

  const mainImage = images[0] || "";

  const price =
    property.price !== null && property.price !== undefined
      ? Number(property.price).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        })
      : "Precio no disponible";

  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  const operationLabel = property.operation_type === "rent" ? "Renta" : "Venta";

  card.innerHTML = `
    <div class="property-card__media">

      ${
        mainImage
          ? `
            <img
              src="${escapeHtml(mainImage)}"
              alt="${escapeHtml(property.title || "Propiedad")}"
              class="property-card__image"
            >
          `
          : `
            <div class="property-card__image-placeholder">
              <i class="bi bi-house"></i>
            </div>
          `
      }

      <span class="property-card__status">
        ${getStatusLabel(property.status)}
      </span>

      <span class="property-card__operation">
        ${operationLabel}
      </span>

    </div>


    <div class="property-card__body">

      <h3 class="property-card__title">
        ${escapeHtml(property.title || "Sin título")}
      </h3>

      <strong class="property-card__price">
        ${price}
        ${property.operation_type === "rent" ? `<small>/ mes</small>` : ""}
      </strong>


      ${
        location
          ? `
            <p class="property-card__location">
              <i class="bi bi-geo-alt-fill"></i>
              ${escapeHtml(location)}
            </p>
          `
          : ""
      }


      <div class="property-card__features">

        ${
          property.bedrooms !== null
            ? `
              <span>
                <i class="bi bi-door-open"></i>
                ${property.bedrooms}
                <small>Rec.</small>
              </span>
            `
            : ""
        }

        ${
          property.bathrooms !== null
            ? `
              <span>
                <i class="bi bi-droplet"></i>
                ${property.bathrooms}
                <small>Baños</small>
              </span>
            `
            : ""
        }

        ${
          property.parking_spaces !== null
            ? `
              <span>
                <i class="bi bi-car-front"></i>
                ${property.parking_spaces}
                <small>Est.</small>
              </span>
            `
            : ""
        }

      </div>


      <div class="property-card__actions">

  <button
    type="button"
    class="btn-icon btn-icon--whatsapp"
    data-action="whatsapp"
    data-property-id="${property.id}"
    title="Compartir por WhatsApp"
    aria-label="Compartir por WhatsApp"
  >
    <i class="bi bi-whatsapp"></i>
  </button>

  <button
    type="button"
    class="btn-icon btn-icon--facebook"
    data-action="facebook"
    data-property-id="${property.id}"
    title="Compartir en Facebook"
    aria-label="Compartir en Facebook"
  >
    <i class="bi bi-facebook"></i>
  </button>

  <button
    type="button"
    class="btn-icon"
    data-action="gallery"
    data-property-id="${property.id}"
    title="Ver galería"
    aria-label="Ver galería"
  >
    <i class="bi bi-images"></i>
  </button>

  <button
    type="button"
    class="btn-icon"
    data-action="edit"
    data-property-id="${property.id}"
    title="Editar propiedad"
    aria-label="Editar propiedad"
  >
    <i class="bi bi-pencil"></i>
  </button>

  <button
    type="button"
    class="btn-icon btn-icon--danger"
    data-action="delete"
    data-property-id="${property.id}"
    title="Eliminar propiedad"
    aria-label="Eliminar propiedad"
  >
    <i class="bi bi-trash"></i>
  </button>

</div>

    </div>
  `;

  return card;
}

propertyList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const action = button.dataset.action;
  const propertyId = button.dataset.propertyId;

  if (!propertyId) return;

  if (action === "whatsapp") {
    const property = properties.find(
      (item) => String(item.id) === String(propertyId),
    );

    if (!property) {
      return;
    }

    sharePropertyWhatsApp(property);
    return;
  }

  if (action === "gallery") {
    window.location.href = `property.html?id=${propertyId}`;
  }
  if (action === "edit") {
    window.location.href = `add-property.html?id=${propertyId}`;
  }

  if (action === "delete") {
    const property = properties.find(
      (item) => String(item.id) === String(propertyId),
    );

    if (!property) {
      return;
    }

    propertyPendingDelete = property;

    deletePropertyName.textContent = property.title || "esta propiedad";

    deletePropertyModal.classList.remove("hidden");
  }
});

function closeDeleteModal() {
  deletePropertyModal.classList.add("hidden");
  propertyPendingDelete = null;
}

closeDeletePropertyModal.addEventListener("click", closeDeleteModal);

cancelDeletePropertyBtn.addEventListener("click", closeDeleteModal);

deletePropertyModal.addEventListener("click", (event) => {
  if (event.target === deletePropertyModal) {
    closeDeleteModal();
  }
});

confirmDeletePropertyBtn.addEventListener("click", async () => {
  if (!propertyPendingDelete) {
    return;
  }

  const propertyId = propertyPendingDelete.id;

  confirmDeletePropertyBtn.disabled = true;
  confirmDeletePropertyBtn.textContent = "Eliminando...";

  const deleted = await deleteProperty(propertyId);

  if (!deleted) {
    alert("No se pudo eliminar la propiedad.");

    confirmDeletePropertyBtn.disabled = false;
    confirmDeletePropertyBtn.innerHTML =
      '<i class="bi bi-trash3"></i> Eliminar propiedad';

    return;
  }

  properties = properties.filter(
    (item) => String(item.id) !== String(propertyId),
  );

  renderProperties(properties);
  updateSummary(properties);

  statusEl.textContent = properties.length
    ? ""
    : "Todavía no tienes propiedades registradas.";

  confirmDeletePropertyBtn.disabled = false;
  confirmDeletePropertyBtn.innerHTML =
    '<i class="bi bi-trash3"></i> Eliminar propiedad';

  closeDeleteModal();
});

// ============================================================
// RESUMEN
// ============================================================

function updateSummary(items) {
  // Propiedades disponibles para venta
  const forSale = items.filter(
    (property) =>
      property.operation_type === "sale" && property.status === "available",
  ).length;

  // Propiedades disponibles para renta
  const forRent = items.filter(
    (property) =>
      property.operation_type === "rent" && property.status === "available",
  ).length;

  // Propiedades vendidas o rentadas
  const closed = items.filter(
    (property) => property.status === "sold" || property.status === "rented",
  ).length;

  totalPropertiesEl.textContent = forSale;
  availablePropertiesEl.textContent = forRent;
  closedPropertiesEl.textContent = closed;
}

// ============================================================
// BUSCADOR
// ============================================================

searchInput.addEventListener("input", applyFilters);

// ============================================================
// STATUS
// ============================================================

function getStatusLabel(status) {
  switch (status) {
    case "sold":
      return "Vendida";

    case "rented":
      return "Rentada";

    case "available":
    default:
      return "Disponible";
  }
}

// ============================================================
// SEGURIDAD HTML
// ============================================================

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ============================================================
// FUNCIONES EN CONSTRUCCIÓN
// ============================================================

// ============================================================
// FUNCIONES EN CONSTRUCCIÓN
// ============================================================

// ============================================================
// FUNCIONES EN CONSTRUCCIÓN
// ============================================================

const underConstructionButtons = [
  document.querySelector("#openAnalyticsBtn"),
  document.querySelector("#shareCatalogBtn"),
  document.querySelector("#openQrPromoBtn"),
  document.querySelector("#facebookMenuBtn"),
  document.querySelector("#settingsMenuBtn"),
];

underConstructionButtons.forEach((button) => {
  button?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      alert("🚧 Función en construcción.\nEstará disponible próximamente.");
    },
    true,
  );
});
