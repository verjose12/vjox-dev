// ============================================================
// VJOX v4.6
// Inmobiliaria · Agregar propiedad
// ============================================================

const form = document.querySelector("#propertyForm");

const steps = [...document.querySelectorAll(".property-form-step")];
const indicators = [
  ...document.querySelectorAll("[data-step-indicator]"),
];

const nextButtons = [...document.querySelectorAll("[data-next-step]")];
const prevButtons = [...document.querySelectorAll("[data-prev-step]")];

const operationInputs = [
  ...document.querySelectorAll('input[name="operationType"]'),
];

const priceUnit = document.querySelector("#priceUnit");

const locationUrlInput = document.querySelector("#locationUrl");
const openMapBtn = document.querySelector("#openMapBtn");

const propertyPhotosInput = document.querySelector("#propertyPhotos");
const photoPreview = document.querySelector("#photoPreview");

let currentStep = 1;


// ============================================================
// INICIO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  updateOperationPrice();
  updateMapButton();
  showStep(1);
});


// ============================================================
// WIZARD
// ============================================================

function showStep(stepNumber) {
  currentStep = stepNumber;

  steps.forEach((step) => {
    const number = Number(step.dataset.step);

    step.hidden = number !== currentStep;
    step.classList.toggle("active", number === currentStep);
  });

  indicators.forEach((indicator) => {
    const number = Number(indicator.dataset.stepIndicator);

    indicator.classList.toggle("active", number === currentStep);
    indicator.classList.toggle("completed", number < currentStep);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


// ============================================================
// SIGUIENTE
// ============================================================

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length) {
      showStep(currentStep + 1);
    }
  });
});


// ============================================================
// ATRÁS
// ============================================================

prevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (currentStep > 1) {
      showStep(currentStep - 1);
    }
  });
});


// ============================================================
// VALIDAR PASO ACTUAL
// ============================================================

function validateCurrentStep() {
  const currentSection = document.querySelector(
    `.property-form-step[data-step="${currentStep}"]`,
  );

  const requiredFields = [
    ...currentSection.querySelectorAll("[required]"),
  ];

  for (const field of requiredFields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  return true;
}


// ============================================================
// VENTA / RENTA
// ============================================================

operationInputs.forEach((input) => {
  input.addEventListener("change", updateOperationPrice);
});

function updateOperationPrice() {
  const selectedOperation = document.querySelector(
    'input[name="operationType"]:checked',
  );

  if (!selectedOperation) {
    priceUnit.textContent = "MXN";
    return;
  }

  priceUnit.textContent =
    selectedOperation.value === "rent"
      ? "MXN/mes"
      : "MXN";
}


// ============================================================
// GOOGLE MAPS
// ============================================================

locationUrlInput.addEventListener("input", updateMapButton);

function updateMapButton() {
  const value = locationUrlInput.value.trim();

  let validUrl = false;

  try {
    const url = new URL(value);

    validUrl =
      url.protocol === "http:" ||
      url.protocol === "https:";
  } catch {
    validUrl = false;
  }

  if (!validUrl) {
    openMapBtn.href = "#";
    openMapBtn.setAttribute("aria-disabled", "true");
    return;
  }

  openMapBtn.href = value;
  openMapBtn.setAttribute("aria-disabled", "false");
}


// ============================================================
// PREVIEW DE FOTOGRAFÍAS
// ============================================================

propertyPhotosInput.addEventListener("change", () => {
  renderPhotoPreview(propertyPhotosInput.files);
});

function renderPhotoPreview(files) {
  photoPreview.innerHTML = "";

  if (!files?.length) {
    return;
  }

  [...files].forEach((file) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const item = document.createElement("div");
    item.className = "property-photo-preview__item";

    const image = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    image.src = objectUrl;
    image.alt = "Vista previa de la propiedad";

    image.addEventListener(
      "load",
      () => URL.revokeObjectURL(objectUrl),
      { once: true },
    );

    item.appendChild(image);
    photoPreview.appendChild(item);
  });
}


// ============================================================
// SUBMIT
// ============================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateCurrentStep()) {
    return;
  }

  const saveButton = document.querySelector("#savePropertyBtn");
  const statusEl = document.querySelector("#propertyStatus");

  try {

    // ==========================================
    // 1. USUARIO
    // ==========================================

    saveButton.disabled = true;

    statusEl.textContent = "Preparando propiedad...";

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "No se pudo obtener el usuario autenticado."
      );
    }


    // ==========================================
    // 2. SUBIR FOTOGRAFÍAS
    // ==========================================

    const imageUrls = [];

    const files = [
      ...propertyPhotosInput.files
    ];

    for (let i = 0; i < files.length; i++) {

      statusEl.textContent =
        `Subiendo fotografía ${i + 1} de ${files.length}...`;

      const compressedFile =
        await compressImage(files[i]);

      const imageUrl =
        await uploadImageToCloudinary(
          compressedFile,
          user.id,
          "properties"
        );

      imageUrls.push(imageUrl);
    }


    // ==========================================
    // 3. LEER FORMULARIO
    // ==========================================

    const operationType = document.querySelector(
      'input[name="operationType"]:checked'
    )?.value;

    const property = {
      user_id: user.id,

      title:
        document.querySelector("#title")
          .value
          .trim(),

      price:
        Number(
          document.querySelector("#price").value
        ),

      operation_type: operationType,

      property_type:
        document.querySelector("#propertyType")
          .value,

      neighborhood:
        document.querySelector("#neighborhood")
          .value
          .trim(),

      city:
        document.querySelector("#city")
          .value
          .trim(),

      location_url:
        document.querySelector("#locationUrl")
          .value
          .trim() || null,

      bedrooms:
        numberOrNull("#bedrooms"),

      bathrooms:
        numberOrNull("#bathrooms"),

      parking_spaces:
        numberOrNull("#parkingSpaces"),

      description:
        document.querySelector("#description")
          .value
          .trim() || null,

      status:
        document.querySelector("#status")
          .value,

      image_urls: imageUrls,
    };


    // ==========================================
    // 4. GUARDAR EN SUPABASE
    // ==========================================

    statusEl.textContent =
      "Guardando propiedad...";

    const savedProperty =
      await saveProperty(property);

    if (!savedProperty) {
      throw new Error(
        "Supabase no pudo guardar la propiedad."
      );
    }


    // ==========================================
    // 5. TERMINADO
    // ==========================================

    statusEl.textContent =
      "Propiedad guardada correctamente.";

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 700);

  } catch (error) {

    console.error(
      "Error guardando propiedad:",
      error
    );

    statusEl.textContent =
      "No se pudo guardar la propiedad. Intenta nuevamente.";

    saveButton.disabled = false;
  }
});

function numberOrNull(selector) {
  const value = document
    .querySelector(selector)
    .value
    .trim();

  if (value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}