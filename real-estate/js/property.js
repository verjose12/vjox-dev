document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);

  const propertyId = params.get("id");

  if (!propertyId) {
    showPropertyError("No se especificó una propiedad.");
    return;
  }

  const property = await getPropertyById(propertyId);

  if (!property) {
    showPropertyError("No se encontró la propiedad.");
    return;
  }

  renderProperty(property);

  await renderPropertyNavigation(propertyId, property.user_id);
});

function renderProperty(property) {
  // =========================
  // INFORMACIÓN PRINCIPAL
  // =========================

  document.getElementById("propertyTitle").textContent =
    property.title || "Propiedad";

  const price =
    property.price !== null
      ? Number(property.price).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        })
      : "Precio no disponible";

  document.getElementById("propertyPrice").textContent =
    property.operation_type === "rent" ? `${price} / mes` : price;

  // =========================
  // ESTADO / OPERACIÓN
  // =========================

  const operationElement = document.getElementById("propertyOperation");

  operationElement.textContent =
    property.operation_type === "rent"
      ? "Propiedad en renta"
      : "Propiedad en venta";

  operationElement.className =
    "property-detail__badge property-detail__badge--status";
  // =========================
  // UBICACIÓN
  // =========================

  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  document.getElementById("propertyLocation").innerHTML = location
    ? `<i class="bi bi-geo-alt-fill"></i> ${escapeHtml(location)}`
    : "";

  document.getElementById("propertyFullLocation").textContent =
    location || "Ubicación no disponible";

  // =========================
  // CARACTERÍSTICAS
  // =========================

  document.getElementById("propertyBedrooms").textContent =
    property.bedrooms ?? "--";

  document.getElementById("propertyBathrooms").textContent =
    property.bathrooms ?? "--";

  document.getElementById("propertyParking").textContent =
    property.parking_spaces ?? "--";

  // =========================
  // DESCRIPCIÓN
  // =========================

  document.getElementById("propertyDescription").textContent =
    property.description || "Sin descripción.";

  // =========================
  // GOOGLE MAPS
  // =========================

  const mapsButton = document.getElementById("propertyMapsButton");

  if (property.location_url) {
    mapsButton.href = property.location_url;
  } else {
    mapsButton.style.display = "none";
  }

  // =========================
  // GALERÍA
  // =========================

  renderGallery(property.image_urls);
}

function renderGallery(imageUrls) {
  const images = Array.isArray(imageUrls) ? imageUrls : [];

  let currentImageIndex = 0;

  const mainContainer = document.getElementById("propertyMainImage");

  const thumbnailsContainer = document.getElementById("propertyThumbnails");

  mainContainer.innerHTML = "";
  thumbnailsContainer.innerHTML = "";

  if (!images.length) {
    mainContainer.innerHTML = `
      <div class="property-gallery__empty">
        <i class="bi bi-image"></i>
        <span>Sin fotografías</span>
      </div>
    `;

    return;
  }

  // FOTO PRINCIPAL
  const mainImage = document.createElement("img");

  mainImage.src = images[0];
  mainImage.alt = "Fotografía de la propiedad";
  mainImage.id = "galleryMainImage";

  mainContainer.appendChild(mainImage);

  mainImage.addEventListener("click", () => {
    openImageViewer(images, currentImageIndex);
  });

  mainImage.addEventListener("click", () => {
    const currentIndex = images.indexOf(mainImage.src);

    openImageViewer(images, currentIndex >= 0 ? currentIndex : 0);
  });

  // MINIATURAS
  images.forEach((imageUrl, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "property-gallery__thumbnail";

    if (index === 0) {
      button.classList.add("is-active");
    }

    const image = document.createElement("img");

    image.src = imageUrl;
    image.alt = `Fotografía ${index + 1}`;

    button.appendChild(image);

    button.addEventListener("click", () => {
      mainImage.src = imageUrl;

      document
        .querySelectorAll(".property-gallery__thumbnail")
        .forEach((thumbnail) => {
          thumbnail.classList.remove("is-active");
        });

      button.classList.add("is-active");
    });

    thumbnailsContainer.appendChild(button);
  });
}

async function renderPropertyNavigation(currentPropertyId, userId) {
  const propertyNav = document.querySelector("#propertyNav");

  if (!propertyNav) {
    return;
  }

  if (!userId) {
    console.warn("No se encontró el usuario de las propiedades.");
    return;
  }

  const properties = await getMyProperties(userId);

  propertyNav.innerHTML = "";

  properties.forEach((property) => {
    const link = document.createElement("a");

    link.href = `property.html?id=${property.id}`;

    link.textContent = property.title || "Propiedad";

    if (String(property.id) === String(currentPropertyId)) {
      link.classList.add("active");
    }

    propertyNav.appendChild(link);
  });
}

function openImageViewer(images, startIndex = 0) {
  let currentIndex = startIndex;
  let touchStartX = 0;

  const viewer = document.createElement("div");
  viewer.className = "image-viewer";

  viewer.innerHTML = `
    <button
      type="button"
      class="image-viewer__close"
      aria-label="Cerrar"
    >
      <i class="bi bi-x-lg"></i>
    </button>

    <button
      type="button"
      class="image-viewer__nav image-viewer__nav--prev"
      aria-label="Imagen anterior"
    >
      <i class="bi bi-chevron-left"></i>
    </button>

    <img
      class="image-viewer__image"
      alt="Fotografía ampliada"
    >

    <button
      type="button"
      class="image-viewer__nav image-viewer__nav--next"
      aria-label="Imagen siguiente"
    >
      <i class="bi bi-chevron-right"></i>
    </button>

    <span class="image-viewer__counter"></span>
  `;

  const image = viewer.querySelector(".image-viewer__image");
  const counter = viewer.querySelector(".image-viewer__counter");
  const closeButton = viewer.querySelector(".image-viewer__close");
  const prevButton = viewer.querySelector(".image-viewer__nav--prev");
  const nextButton = viewer.querySelector(".image-viewer__nav--next");

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;

    image.src = images[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function closeViewer() {
    document.removeEventListener("keydown", handleKeyboard);

    viewer.remove();
    document.body.style.overflow = "";
  }

  prevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showImage(currentIndex - 1);
  });

  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showImage(currentIndex + 1);
  });

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeViewer();
  });

  // Cerrar tocando el fondo
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      closeViewer();
    }
  });

  // SWIPE EN CELULAR
  viewer.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  });

  viewer.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].screenX;

    const difference = touchStartX - touchEndX;

    // Evita cambiar por movimientos muy pequeños
    if (Math.abs(difference) < 50) {
      return;
    }

    if (difference > 0) {
      showImage(currentIndex + 1);
    } else {
      showImage(currentIndex - 1);
    }
  });

  // TECLADO EN COMPUTADORA
  function handleKeyboard(event) {
    if (event.key === "ArrowLeft") {
      showImage(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showImage(currentIndex + 1);
    }

    if (event.key === "Escape") {
      closeViewer();
    }
  }

  document.addEventListener("keydown", handleKeyboard);
  document.body.appendChild(viewer);
  document.body.style.overflow = "hidden";

  showImage(currentIndex);
}

function getPropertyStatusLabel(status) {
  switch (status) {
    case "available":
      return "Disponible";

    case "sold":
      return "Vendida";

    case "rented":
      return "Rentada";

    default:
      return status || "Sin estado";
  }
}

function showPropertyError(message) {
  const title = document.getElementById("propertyTitle");

  if (title) {
    title.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
