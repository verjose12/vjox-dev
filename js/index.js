const state ={
  items: [],
  editingProduct: null
};

const $ = s => document.querySelector(s);


const list = $("#list");
const statusEl = $("#status");

const searchInput = $("#searchInput");

const totalProductsEl = $("#totalProducts");
const totalStockEl = $("#totalStock");
const inventoryValueEl = $("#inventoryValue");

const toggleInventoryValueBtn =
  $("#toggleInventoryValue");

// const logoutBtn = $("#logoutBtn");

// Estado
let isInventoryValueVisible = true;

//obtenemos los elementos del modal 

const editModal = $("#editModal");
const modalTitle = $("#modalTitle");
const modalPhotos = $("#modalPhotos");
const modalStock = $("#modalStock");
const closeModalBtn = $("#closeModalBtn");
const finishEditBtn = $("#finishEditBtn");
const addProductPhotos = $("#addProductPhotos");
const addProductPhotosBtn = $("#addProductPhotosBtn");
const addProductStatus = $("#addProductStatus");



function formatPrice(n) {
  if (n == null || n === "") return "";

  const value = Number(n);

  try {
    return value.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 2
    });
  } catch {
    return `MXN ${value.toFixed(2)}`;
  }
}

function getProductPriceLabel(product) {
  if (product.price != null && product.price !== "") {
    return formatPrice(product.price);
  }

  const hasIndividualPrices =
    Array.isArray(product.perPhotoPrices) &&
    product.perPhotoPrices.some(
      price => price !== null && price !== ""
    );

  if (hasIndividualPrices) {
    return "Varios precios";
  }

  return "Sin precio";
}


function setStatus(msg, isError=false){
  statusEl.textContent = msg;
  statusEl.className = isError ? "muted bad" : "muted ok";
}

function adaptProductFromDatabase(product) {
  return {
    id: product.id,
    userId: product.user_id,
    title: product.title,
    price: product.price,
    desc: product.description,
    urls: product.image_urls || [],
    perPhoto: product.per_photo,
    perPhotoPrices: product.per_photo_prices || [],
    perPhotoStock: product.per_photo_stock || [],
    stock: product.stock ?? 0,
    category: product.category || "",
    createdAt: product.created_at
  };
}

async function loadProductsFromDatabase() {
  setStatus("Cargando publicaciones...");

  // const products = await getProducts();

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();
  
  if (!user) {
    setStatus("Debes iniciar sesión.");
    return;
  }
  
  const products = await getMyProducts(user.id);

  state.items = products.map(adaptProductFromDatabase); 
 
  updateInventorySummary();
  renderList();

  setStatus("");
}

function openProductEditor(product) {
  state.editingProduct = product;

  modalTitle.textContent = `Editar: ${product.title}`;

  renderModalPhotos();

  editModal.classList.remove("hidden");
}

function renderModalPhotos() {
  const product = state.editingProduct;

  if (!product) return;

  modalPhotos.innerHTML = "";

  product.urls.forEach((imageUrl, index) => {
    const photoCard = document.createElement("div");
    photoCard.className = "modal-photo";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = product.title;
    img.className = "modal-product-image";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-photo-btn";
    deleteButton.textContent = "Eliminar";

    deleteButton.addEventListener("click", () => {
      deleteProductPhoto(index);
    });

    photoCard.appendChild(img);
    photoCard.appendChild(deleteButton);

    modalPhotos.appendChild(photoCard);
  });
}

async function deleteProductPhoto(photoIndex) {
  const product = state.editingProduct;

  if (!product) return;

  const confirmed = confirm(
    "¿Seguro que quieres eliminar esta imagen?"
  );

  if (!confirmed) return;

  const updatedUrls = product.urls.filter(
    (_, index) => index !== photoIndex
  );

  const newStock = updatedUrls.length;

  const updatedProduct = await updateProductPhotos(
    product.id,
    updatedUrls,
    newStock
  );

  if (!updatedProduct) {
    setStatus("No se pudo actualizar el producto.", true);
    return;
  }

  product.urls = updatedUrls;
  product.stock = newStock;

  updateInventorySummary();

  renderModalPhotos();
  renderList();

  setStatus("Imagen eliminada y stock actualizado.");
}

async function addPhotosToProduct() {
  const product = state.editingProduct;

  if (!product) {
    return;
  }

  const selectedFiles = Array.from(
    addProductPhotos.files || []
  );

  if (selectedFiles.length === 0) {
    addProductStatus.textContent =
      "Selecciona al menos una fotografía.";
    return;
  }

  try {
    addProductPhotosBtn.disabled = true;
    addProductStatus.textContent =
      "Subiendo fotografías...";

    const newUrls = [];

    for (const file of selectedFiles) {
      const imageUrl =
        await uploadImageToCloudinary(file);

      newUrls.push(imageUrl);
    }

    const updatedUrls = [
      ...product.urls,
      ...newUrls
    ];

    const newStock = updatedUrls.length;

    const updatedProduct =
      await updateProductPhotos(
        product.id,
        updatedUrls,
        newStock
      );

    if (!updatedProduct) {
      throw new Error(
        "No se pudo actualizar el producto."
      );
    }

    product.urls = updatedUrls;
    product.stock = newStock;
    updateInventorySummary();

    addProductPhotos.value = "";

    addProductStatus.textContent =
      `${newUrls.length} producto(s) agregado(s) correctamente.`;

    renderModalPhotos();
    renderList();

  } catch (error) {
    console.error(error);

    addProductStatus.textContent =
      `Error: ${error.message}`;

  } finally {
    addProductPhotosBtn.disabled = false;
  }
}

function closeProductEditor() {
  editModal.classList.add("hidden");
  state.editingProduct = null;
}
//eventos del modal
closeModalBtn.addEventListener("click", closeProductEditor);

finishEditBtn.addEventListener("click", closeProductEditor);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeProductEditor();
  }
});

addProductPhotosBtn.addEventListener(
  "click",
  addPhotosToProduct
);

function renderList(items = state.items) {
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = `
      <div class="muted">
        No se encontraron productos.
      </div>
    `;
    return;
  }

  for (const product of items) {
    const cover = product.urls[0];

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
    <img
      src="${cover}"
      alt="${product.title}"
      class="product-card__image"
    >
  
    <div class="product-card__content">
      <div class="product-card__info">
        <strong class="product-card__title">
          ${product.title}
        </strong>
  
        <div class="product-card__meta">
          Stock: <strong>${product.stock}</strong>
          <span>•</span>
          <span>${product.category || "Sin categoría"}</span>
        </div>
  
        <p class="product-card__description">
          ${product.desc || ""}
        </p>
  
        <strong class="product-card__price">
        ${getProductPriceLabel(product)}
        </strong>
      </div>
  
      <div class="product-card__actions">
        <button
          class="icon-btn whats"
          type="button"
          aria-label="Compartir por WhatsApp"
          title="Compartir por WhatsApp"
        >
          <i class="bi bi-whatsapp"></i>
        </button>
  
        <button
          class="icon-btn facebook-btn"
          type="button"
          aria-label="Compartir en Facebook"
          title="Compartir en Facebook"
        >
          <i class="bi bi-facebook"></i>
        </button>
  
        <button
          class="icon-btn gal"
          type="button"
          aria-label="Ver galería"
          title="Ver galería"
        >
          <i class="bi bi-images"></i>
        </button>
  
        <button
          class="icon-btn edit"
          type="button"
          aria-label="Editar producto"
          title="Editar producto"
        >
          <i class="bi bi-pencil"></i>
        </button>
  
        <button
          class="icon-btn del"
          type="button"
          aria-label="Eliminar producto"
          title="Eliminar producto"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;

    const btnWa = div.querySelector(".whats");
    const btnFb = div.querySelector(".facebook-btn");
    const btnEdit = div.querySelector(".edit");
    const btnGal = div.querySelector(".gal");
    const btnDel = div.querySelector(".del");

    btnWa.addEventListener("click", () => {
      shareWhatsApp(product);
    });

    btnFb.addEventListener("click", () => {
      shareFacebook(product, btnFb);
    });

    btnEdit.addEventListener("click", () => {
      openProductEditor(product);
    });

    btnGal.addEventListener("click", () => {
      window.open(buildGalleryLink(product), "_blank");
    });

    btnDel.addEventListener("click", async () => {
      const confirmed = confirm(
        `¿Eliminar "${product.title}"?`
      );

      if (!confirmed) return;

      const deleted = await deleteProduct(product.id);

      if (!deleted) {
        setStatus(
          "No se pudo eliminar el producto.",
          true
        );
        return;
      }

      state.items = state.items.filter(
        item => item.id !== product.id
      );
      
      updateInventorySummary();
      renderList();

      setStatus(
        "Producto eliminado correctamente."
      );
    });

    list.appendChild(div);
  }
}

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value
    .trim()
    .toLowerCase();

  const filteredProducts = state.items.filter(product => {
    const title = product.title?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    const description = product.desc?.toLowerCase() || "";

    return (
      title.includes(searchTerm) ||
      category.includes(searchTerm) ||
      description.includes(searchTerm)
    );
  });

  renderList(filteredProducts);
});

function updateInventorySummary() {
  const totalProducts = state.items.length;

  const totalStock = state.items.reduce((total, product) => {
    return total + Number(product.stock || 0);
  }, 0);

  const inventoryValue = state.items.reduce((total, product) => {
// PRECIO GENERAL
    if (!product.perPhoto) {
      const generalPrice = Number(product.price);
      const generalStock = Number(product.stock || 0);
    
      const productValue =
        Number.isFinite(generalPrice)
          ? generalPrice * generalStock
          : 0;
    
      return total + productValue;
    }
  // PRECIOS DIFERENTES POR FOTO
    const photoPrices = Array.isArray(product.perPhotoPrices)
    ? product.perPhotoPrices
    : [];
  
  const photoStock = Array.isArray(product.perPhotoStock)
    ? product.perPhotoStock
    : [];

  // const productValue = photoPrices.reduce((subtotal, price) => {
  //   const numericPrice = Number(price);

  //   return subtotal + (
  //     Number.isFinite(numericPrice)
  //       ? numericPrice
  //       : 0
  //   );
  // }, 0);

  const productValue = photoPrices.reduce((subtotal, price, index) => {
    const numericPrice = Number(price);
    const quantity = Number(photoStock[index] || 1);
  
    return subtotal + (
      Number.isFinite(numericPrice)
        ? numericPrice * quantity
        : 0
    );
  }, 0);

  return total + productValue;
}, 0);

  totalProductsEl.textContent = totalProducts;
  totalStockEl.textContent = totalStock;
const formattedValue = formatPrice(inventoryValue);

inventoryValueEl.dataset.visibleValue = formattedValue;

inventoryValueEl.textContent =
  isInventoryValueVisible
    ? formattedValue
    : "••••••";
}

toggleInventoryValueBtn.addEventListener("click", () => {
  isInventoryValueVisible = !isInventoryValueVisible;

  const icon =
    toggleInventoryValueBtn.querySelector("i");

  if (isInventoryValueVisible) {
    inventoryValueEl.textContent =
      inventoryValueEl.dataset.visibleValue || "$0";

    icon.className = "bi bi-eye";

    toggleInventoryValueBtn.setAttribute(
      "aria-label",
      "Ocultar valor del inventario"
    );

    toggleInventoryValueBtn.title =
      "Ocultar valor";
  } else {
    inventoryValueEl.textContent = "••••••";

    icon.className = "bi bi-eye-slash";

    toggleInventoryValueBtn.setAttribute(
      "aria-label",
      "Mostrar valor del inventario"
    );

    toggleInventoryValueBtn.title =
      "Mostrar valor";
  }
});

// if (logoutBtn) {
//   logoutBtn.addEventListener("click", async (event) => {
//     event.preventDefault();

//     const { error } = await supabaseClient.auth.signOut();

//     if (error) {
//       console.error("Error al cerrar sesión:", error);
//       return;
//     }

//     window.location.href = "./auth/login.html";
//   });
// }

async function init() {
  const user = await requireAuth();

  if (!user) {
    return;
  }

  await loadProductsFromDatabase();
}

init();
// arranque
// loadProductsFromDatabase();
//renderList();
