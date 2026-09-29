const DEFAULT_PHONE = "";

const __utf8 = new TextEncoder();

function toBase64UrlUtf8(str) {
  const bytes = __utf8.encode(str);
  let bin = "";

  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }

  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildShareUrlFromState(stateObj) {
  const json = JSON.stringify(stateObj);
  const base64Url = toBase64UrlUtf8(json);
  const base = new URL("viewer.html", location.href).toString();

  return `${base}#s=${encodeURIComponent(base64Url)}`;
}


function buildGalleryLink(item) {
  const url = new URL("viewer.html", location.href);

  url.searchParams.set("id", item.id);

  if (item.userId) {
    url.searchParams.set("user", item.userId);
  }

  url.searchParams.set("v", "2");

  return url.toString();
}



function buildMessage(item) {
  const galleryLink = buildGalleryLink(item);
  const lines = [];

  lines.push(`*${item.title}*`);

  if (item.desc) {
    lines.push(item.desc);
  }

  lines.push("");
  lines.push("👉 *Ver fotos del producto:*");
  lines.push(galleryLink);
  lines.push("");
  lines.push("_Consulta disponibilidad. Envío/entrega a convenir._");

  return lines.join("\n");
}

// async function shareFacebook(product, button) {

async function shareFacebook(product, button) {
  if (
    typeof openFacebookForProduct !== "function"
  ) {
    console.error(
      "El módulo de Facebook no está disponible."
    );

    return;
  }

  await openFacebookForProduct(
    product,
    button
  );
}


async function publishFacebookProduct(product, button) {

  /* -----------------------------------------
     1. Verificar imagen
  ----------------------------------------- */

  const imageUrl = product.urls?.[0];

  if (!imageUrl) {
    alert(
      "Este producto no tiene una imagen para publicar."
    );
    return;
  }


  /* -----------------------------------------
     2. Estado del botón
  ----------------------------------------- */

  const originalContent = button.innerHTML;

  button.disabled = true;

  button.innerHTML = `
    <span class="spinner-border spinner-border-sm"></span>
  `;


  /* -----------------------------------------
     3. Link de la galería
  ----------------------------------------- */

  const galleryLink =
    buildGalleryLink(product);


  /* -----------------------------------------
     4. Calcular precio
  ----------------------------------------- */

  const photoPrices =
    Array.isArray(product.perPhotoPrices)
      ? product.perPhotoPrices
          .map(Number)
          .filter(
            (price) =>
              Number.isFinite(price) &&
              price > 0
          )
      : [];

  const uniquePrices =
    [...new Set(photoPrices)];


  let priceText =
    "Consulta precio";

  let priceNote =
    "Contacta al vendedor para conocer el precio.";


  // Diferentes precios por fotografía
  if (uniquePrices.length > 1) {

    priceText =
      "Varios precios";

    priceNote =
      "Consulta cada opción en el catálogo.";

  }

  // Todas las fotografías tienen el mismo precio
  else if (uniquePrices.length === 1) {

    priceText =
      formatPrice(uniquePrices[0]);

    priceNote =
      "Todos los artículos de este producto tienen el mismo precio.";

  }

  // Precio general del producto
  else if (Number(product.price) > 0) {

    priceText =
      formatPrice(product.price);

    priceNote =
      "Todos los artículos de este producto tienen el mismo precio.";

  }


  /* -----------------------------------------
     5. Crear mensaje para Facebook
  ----------------------------------------- */

  const message = [
    `🛍️ ${product.title}`,
    "",

    `💰 ${priceText}`,
    priceNote,
    "",

    product.desc
      ? `✨ ${product.desc}`
      : "",

    "",

    "📸 Ver todas las fotografías:",
    galleryLink,

    "",

    "📩 Consulta disponibilidad."
  ]
    .filter(Boolean)
    .join("\n");


  /* -----------------------------------------
     6. Publicar
  ----------------------------------------- */

  try {

    const { data, error } =
      await supabaseClient.functions.invoke(
        "publish-facebook",
        {
          body: {
            imageUrl,
            message
          }
        }
      );


    /* ---------------------------------------
       Error de Edge Function
    --------------------------------------- */

    if (error) {

      let errorDetails = null;

      try {

        errorDetails =
          await error.context.json();

      } catch {

        errorDetails = {
          message: error.message
        };

      }


      console.error(
        "Respuesta completa de la Edge Function:",
        errorDetails
      );


      throw new Error(
        errorDetails?.error?.error?.message ||
        errorDetails?.error?.message ||
        errorDetails?.error ||
        errorDetails?.message ||
        error.message
      );

    }


    /* ---------------------------------------
       Error devuelto por Meta
    --------------------------------------- */

    if (!data?.ok) {

      throw new Error(
        data?.error?.error?.message ||
        data?.error ||
        "Meta no pudo crear la publicación."
      );

    }


    /* ---------------------------------------
       Publicación exitosa
    --------------------------------------- */

    alert(
      "✅ Producto publicado correctamente en Facebook."
    );


  } catch (error) {

    console.error(
      "Error publicando en Facebook:",
      error
    );


    alert(
      `❌ No se pudo publicar en Facebook.\n\n${error.message}`
    );


  } finally {

    /* ---------------------------------------
       Restaurar botón
    --------------------------------------- */

    button.disabled = false;
    button.innerHTML =
      originalContent;

  }
}

function shareWhatsApp(item) {
  const message = encodeURIComponent(buildMessage(item));

  const base = DEFAULT_PHONE
    ? `https://wa.me/${DEFAULT_PHONE}?text=`
    : "https://api.whatsapp.com/send?text=";

  window.open(base + message, "_blank");
}

async function copyMessage(item) {
  const message = buildMessage(item);

  try {
    await navigator.clipboard.writeText(message);
    alert("Mensaje copiado ✅ Pégalo en WhatsApp.");
  } catch {
    prompt("Copia el mensaje:", message);
  }
}