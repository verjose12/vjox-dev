// ========================================
// VJOX INMOBILIARIO - SHARE
// ========================================

function buildPropertyShareLink(property) {
  const url = new URL("property.html", window.location.href);

  url.searchParams.set("id", property.id);

  return url.toString();
}

function buildPropertyMessage(property) {
  const propertyLink = buildPropertyShareLink(property);

  const price =
    property.price != null
      ? Number(property.price).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        })
      : "Consulta precio";

  const operation = property.operation_type === "rent" ? "Renta" : "Venta";

  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  const lines = [];

  lines.push(`*${property.title || "Propiedad"}*`);
  //   lines.push(`${operation} · ${price}`);
  lines.push(`Propiedad en ${operation.toLowerCase()} · ${price}`);

  if (location) {
    lines.push(location);
  }

  lines.push("");
  lines.push("*Ver fotografías y detalles:*");
  lines.push(propertyLink);

  return lines.join("\n");
}

function sharePropertyWhatsApp(property) {
  const message = encodeURIComponent(buildPropertyMessage(property));

  const whatsappUrl = `https://api.whatsapp.com/send?text=${message}`;

  window.open(whatsappUrl, "_blank");
}
