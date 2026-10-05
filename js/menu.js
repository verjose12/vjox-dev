const menuQuery = (selector) => document.querySelector(selector);

const openSideMenuBtn = menuQuery("#openSideMenuBtn");

const closeSideMenuBtn = menuQuery("#closeSideMenuBtn");

const sideMenu = menuQuery("#sideMenu");

const sideMenuOverlay = menuQuery("#sideMenuOverlay");

const logoutBtn = menuQuery("#logoutBtn");

const shareCatalogBtn = menuQuery("#shareCatalogBtn");

function openSideMenu() {
  sideMenu.classList.add("open");
  sideMenuOverlay.classList.add("show");

  sideMenu.setAttribute("aria-hidden", "false");
  openSideMenuBtn.setAttribute("aria-expanded", "true");

  document.body.style.overflow = "hidden";
}

function closeSideMenu() {
  sideMenu.classList.remove("open");
  sideMenuOverlay.classList.remove("show");

  sideMenu.setAttribute("aria-hidden", "true");
  openSideMenuBtn.setAttribute("aria-expanded", "false");

  document.body.style.overflow = "";
}

openSideMenuBtn.addEventListener("click", openSideMenu);

closeSideMenuBtn.addEventListener("click", closeSideMenu);

sideMenuOverlay.addEventListener("click", closeSideMenu);

sideMenu.querySelectorAll(".side-menu__link").forEach((link) => {
  link.addEventListener("click", () => {
    closeSideMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSideMenu();
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

//     // window.location.href = "./auth/login.html";
//     window.location.replace("./auth/login.html");
//   });
// }

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }

    const loginUrl = document.body.dataset.loginUrl || "./auth/login.html";

    window.location.replace(loginUrl);
  });
}

async function loadSideMenuBusinessName() {
  const businessNameEl = document.querySelector("#sideMenuBusinessName");

  if (!businessNameEl) return;

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    businessNameEl.textContent = "Mi negocio";

    return;
  }

  let displayName = "Mi negocio";

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("name, business_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileError && profile) {
    displayName = profile.business_name || profile.name || "Mi negocio";
  }

  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "facebook-connection-info",
    );

    if (!error && data?.connected && data?.page?.name) {
      displayName = data.page.name;
    }
  } catch (error) {
    console.warn("No se pudo cargar la página de Facebook:", error);
  }

  businessNameEl.textContent = displayName;
}

async function shareCatalog() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    console.error("No se pudo obtener el usuario.", error);
    return;
  }

  const { error: analyticsError } = await supabaseClient
    .from("analytics_events")
    .insert({
      user_id: user.id,
      event_type: "share_click",
      product_id: null,
      source: "share",
    });

  if (analyticsError) {
    console.error("Error registrando compartir:", analyticsError);
  }

  const catalogUrl = new URL("viewer_qr.html", window.location.href);

  catalogUrl.searchParams.set("user", user.id);
  catalogUrl.searchParams.set("source", "share");

  const shareData = {
    title: "Mi catálogo VJOX",
    text: "Mira los productos disponibles en mi catálogo.",
    url: catalogUrl.toString(),
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(catalogUrl.toString());

      alert("Link del catálogo copiado.");
      return;
    }

    prompt("Copia este enlace:", catalogUrl.toString());
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error("Error al compartir el catálogo:", error);
  }
}

if (shareCatalogBtn) {
  shareCatalogBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    await shareCatalog();
  });
}

loadSideMenuBusinessName();
