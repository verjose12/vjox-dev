const profileForm = document.querySelector("#profileForm");
const statusEl = document.querySelector("#profileStatus");

const facebookModal = document.querySelector("#facebookModal");

const connectFacebookBtn = document.querySelector("#connectFacebookBtn");

const skipFacebookBtn = document.querySelector("#skipFacebookBtn");

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusEl.textContent = "Guardando perfil...";

  const {
    data: { session },
    error: sessionError,
  } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    statusEl.textContent = "No hay una sesión activa.";
    return;
  }

  const user = session.user;

  // const name = document.querySelector("#name").value.trim();

  // const businessName = document.querySelector("#businessName").value.trim();

  // const whatsappPhone = document.querySelector("#whatsappPhone").value.trim();

  // const profile = {
  //   id: user.id,
  //   name: name,
  //   business_name: businessName,
  //   whatsapp_phone: whatsappPhone,
  // };

  const name = document.querySelector("#name").value.trim();

  const businessName = document.querySelector("#businessName").value.trim();

  const whatsappPhone = document.querySelector("#whatsappPhone").value.trim();

  const businessType = document.querySelector(
    'input[name="businessType"]:checked',
  )?.value;

  if (!businessType) {
    statusEl.textContent = "Selecciona el giro de tu negocio.";
    return;
  }

  const profile = {
    id: user.id,
    name: name,
    business_name: businessName,
    whatsapp_phone: whatsappPhone,
    business_type: businessType,
  };
  const savedProfile = await createProfile(profile);

  if (!savedProfile) {
    statusEl.textContent = "No se pudo guardar el perfil.";
    return;
  }

  statusEl.textContent = "Perfil guardado correctamente.";

  facebookModal.classList.add("is-open");

  facebookModal.setAttribute("aria-hidden", "false");
});

// ESTE YA ESTÁ FUERA DEL FORMULARIO 👇

skipFacebookBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

connectFacebookBtn.addEventListener("click", async () => {
  const originalContent = connectFacebookBtn.innerHTML;

  connectFacebookBtn.disabled = true;

  connectFacebookBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span>
    `;

  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "facebook-connect-start",
    );

    if (error) {
      console.error(error);

      alert("No se pudo iniciar la conexión con Facebook.");

      return;
    }

    if (!data?.url) {
      alert("VJOX no recibió la URL de autorización.");

      return;
    }

    window.location.href = data.url;
  } catch (error) {
    console.error("Error conectando Facebook:", error);

    alert("Ocurrió un error al conectar Facebook.");
  } finally {
    connectFacebookBtn.disabled = false;

    connectFacebookBtn.innerHTML = originalContent;
  }
});

const params = new URLSearchParams(window.location.search);

const facebookStatus = params.get("facebook");

if (facebookStatus === "select") {
  facebookModal.classList.add("is-open");

  facebookModal.setAttribute("aria-hidden", "false");

  loadPendingFacebookPages();
}

if (facebookStatus === "connected") {
  facebookModal.classList.add("is-open");

  facebookModal.setAttribute("aria-hidden", "false");

  const modalContent = facebookModal.querySelector(".setup-modal__content");

  if (modalContent) {
    modalContent.innerHTML = `
        <div class="setup-modal__icon">
          <i class="bi bi-check-circle"></i>
        </div>
  
        <h2>
          Facebook conectado
        </h2>
  
        <p>
          Tu página de Facebook quedó conectada correctamente con VJOX.
        </p>
  
        <button
          id="finishFacebookSetupBtn"
          type="button"
          class="btn btn--primary btn--full"
        >
          Continuar a VJOX
        </button>
      `;

    const finishBtn = document.querySelector("#finishFacebookSetupBtn");

    finishBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

async function loadPendingFacebookPages() {
  const modalContent = facebookModal.querySelector(".setup-modal__content");

  if (!modalContent) return;

  modalContent.innerHTML = `
      <div class="setup-modal__icon">
        <i class="bi bi-facebook"></i>
      </div>
  
      <h2>
        Selecciona tu página
      </h2>
  
      <p>
        Encontramos varias páginas de Facebook.
        Elige cuál quieres conectar con VJOX.
      </p>
  
      <div id="facebookPagesList">
        Cargando páginas...
      </div>
  
      <button
        id="confirmFacebookPageBtn"
        type="button"
        class="btn btn--primary btn--full"
        disabled
      >
        Conectar página
      </button>
    `;

  const pagesList = document.querySelector("#facebookPagesList");

  const confirmBtn = document.querySelector("#confirmFacebookPageBtn");

  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "facebook-connect-pending-pages",
    );

    if (error) {
      console.error(error);

      pagesList.textContent = "No se pudieron cargar las páginas.";

      return;
    }

    const pages = data?.pages || [];

    if (pages.length === 0) {
      pagesList.textContent = "No encontramos páginas disponibles.";

      return;
    }

    pagesList.innerHTML = "";

    pages.forEach((page) => {
      const option = document.createElement("label");

      option.className = "facebook-page-option";

      const radio = document.createElement("input");

      radio.type = "radio";

      radio.name = "facebookPage";

      radio.value = page.page_id;

      const name = document.createElement("span");

      name.textContent = page.page_name;

      option.appendChild(radio);

      option.appendChild(name);

      pagesList.appendChild(option);
    });

    pagesList.addEventListener("change", () => {
      const selected = document.querySelector(
        'input[name="facebookPage"]:checked',
      );

      confirmBtn.disabled = !selected;
    });

    confirmBtn.addEventListener("click", async () => {
      const selected = document.querySelector(
        'input[name="facebookPage"]:checked',
      );

      if (!selected) return;

      const originalContent = confirmBtn.innerHTML;

      confirmBtn.disabled = true;

      confirmBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Conectando...
          `;

      try {
        const { data: connectData, error: connectError } =
          await supabaseClient.functions.invoke(
            "facebook-connect-select-page",
            {
              body: {
                page_id: selected.value,
              },
            },
          );

        if (connectError) {
          console.error(connectError);

          confirmBtn.innerHTML = "No se pudo conectar";

          return;
        }

        if (!connectData?.connected) {
          confirmBtn.innerHTML = "No se pudo conectar";

          return;
        }

        modalContent.innerHTML = `
              <div class="setup-modal__icon">
                <i class="bi bi-check-circle"></i>
              </div>
  
              <h2>
                Facebook conectado
              </h2>
  
              <p>
                La página
                <strong id="connectedFacebookPageName"></strong>
                quedó conectada correctamente con VJOX.
              </p>
  
              <button
                id="finishFacebookSetupBtn"
                type="button"
                class="btn btn--primary btn--full"
              >
                Continuar a VJOX
              </button>
            `;

        document.querySelector("#connectedFacebookPageName").textContent =
          connectData.page.name;

        document
          .querySelector("#finishFacebookSetupBtn")
          .addEventListener("click", () => {
            window.location.href = "index.html";
          });
      } catch (error) {
        console.error("Error conectando página:", error);

        confirmBtn.innerHTML = "No se pudo conectar";
      } finally {
        if (document.body.contains(confirmBtn)) {
          confirmBtn.disabled = false;

          confirmBtn.innerHTML = originalContent;
        }
      }
    });
  } catch (error) {
    console.error("Error cargando páginas:", error);

    pagesList.textContent = "No se pudieron cargar las páginas.";
  }
}
