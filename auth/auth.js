function getAuthErrorMessage(error) {
  const message = error?.message || "";

  switch (message) {
    case "Invalid login credentials":
      return "Correo o contraseña incorrectos.";

    case "Email not confirmed":
      return "Tu correo todavía no ha sido confirmado.";

    case "User already registered":
      return "Ya existe una cuenta con este correo.";

    case "Password should be at least 6 characters":
      return "La contraseña debe tener al menos 6 caracteres.";

    default:
      return "Ocurrió un problema. Inténtalo nuevamente.";
  }
}

const registerForm = document.querySelector("#registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.querySelector("#registerName").value.trim();
    const email = document.querySelector("#registerEmail").value.trim();
    const password = document.querySelector("#registerPassword").value;

    const status = document.querySelector("#registerStatus");

    status.textContent = "Creando cuenta...";

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://vjox.com.mx/auth/login.html",

        data: {
          name,
        },
      },
    });

    if (error) {
      console.error(error);
      status.textContent = error.message;
      return;
    }

    console.log("Usuario creado:", data);

    status.textContent = "Cuenta creada correctamente, confirma tu email.";
  });
}

const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#loginEmail").value.trim();

    const password = document.querySelector("#loginPassword").value;

    const status = document.querySelector("#loginStatus");
    const loginButton = document.querySelector("#loginButton");

    status.classList.remove("is-error", "is-success");
    status.textContent = "Iniciando sesión...";

    loginButton.disabled = true;
    loginButton.textContent = "Iniciando...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);

      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesión";

      if (error.message === "Email not confirmed") {
        status.innerHTML = `
          Tu correo aún no ha sido confirmado.<br><br>
          <button type="button" id="resendConfirmationBtn">
            Reenviar correo de confirmación
          </button>
        `;

        const resendBtn = document.querySelector("#resendConfirmationBtn");

        resendBtn.addEventListener("click", async () => {
          resendBtn.disabled = true;
          resendBtn.textContent = "Enviando...";

          const { error: resendError } = await supabaseClient.auth.resend({
            type: "signup",
            email,
            options: {
              emailRedirectTo: "https://vjox.com.mx/auth/login.html",
            },
          });

          if (resendError) {
            console.error("Error reenviando correo:", resendError);

            status.textContent = `Error: ${resendError.message}`;

            return;
          }

          status.textContent =
            "Correo de confirmación reenviado. Revisa tu bandeja de entrada.";
        });

        return;
      }

      status.textContent = getAuthErrorMessage(error);
      status.classList.add("is-error");
      return;
    }

    console.log("Sesión iniciada:", data);

    status.textContent = "Sesión iniciada correctamente.";

    const user = data.user;

    // const profile = await getProfile(user.id);

    // setTimeout(() => {
    //   if (profile) {
    //     window.location.href = "../index.html";
    //   } else {
    //     window.location.href = "../profiles-setup.html";
    //   }
    // }, 800);
    const profile = await getProfile(user.id);

    setTimeout(() => {
      if (!profile) {
        window.location.href = "../profiles-setup.html";
        return;
      }

      if (profile.business_type === "real_estate") {
        window.location.href = "../real-estate/index.html";
        return;
      }

      window.location.href = "../index.html";
    }, 800);
  });
}

const toggleLoginPassword = document.querySelector("#toggleLoginPassword");
const loginPassword = document.querySelector("#loginPassword");
const eyeSlash = document.querySelector("#eyeSlash");

if (toggleLoginPassword && loginPassword) {
  toggleLoginPassword.addEventListener("click", () => {
    const isHidden = loginPassword.type === "password";
    loginPassword.type = isHidden ? "text" : "password";
    if (eyeSlash) {
      eyeSlash.style.display = isHidden ? "block" : "none";
    }

    toggleLoginPassword.setAttribute(
      "aria-label",
      isHidden ? "Ocultar contraseña" : "Mostrar contraseña",
    );
  });
}

const forgotPasswordForm = document.querySelector("#forgotPasswordForm");

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#forgotEmail").value.trim();
    const status = document.querySelector("#forgotPasswordStatus");
    const button = document.querySelector("#forgotPasswordButton");

    status.classList.remove("is-error", "is-success");
    status.textContent = "Enviando enlace...";

    button.disabled = true;
    button.textContent = "Enviando...";

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: "https://vjox.com.mx/auth/update-password.html",
    });

    button.disabled = false;
    button.textContent = "Enviar enlace";

    if (error) {
      console.error("Error recuperando contraseña:", error);

      status.textContent = "No pudimos enviar el enlace. Inténtalo nuevamente.";
      status.classList.add("is-error");
      return;
    }

    status.textContent =
      "Te enviamos un enlace para recuperar tu contraseña. Revisa tu correo.";
    status.classList.add("is-success");
  });
}

const updatePasswordForm = document.querySelector("#updatePasswordForm");

if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.querySelector("#newPassword").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;
    const status = document.querySelector("#updatePasswordStatus");
    const button = document.querySelector("#updatePasswordButton");

    status.classList.remove("is-error", "is-success");

    if (newPassword !== confirmPassword) {
      status.textContent = "Las contraseñas no coinciden.";
      status.classList.add("is-error");
      return;
    }

    button.disabled = true;
    button.textContent = "Guardando...";
    status.textContent = "Actualizando contraseña...";

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    button.disabled = false;
    button.textContent = "Guardar nueva contraseña";

    if (error) {
      console.error("Error actualizando contraseña:", error);

      status.textContent =
        "No pudimos actualizar tu contraseña. Solicita un nuevo enlace e inténtalo nuevamente.";
      status.classList.add("is-error");
      return;
    }

    status.textContent = "Contraseña actualizada correctamente.";
    status.classList.add("is-success");

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
  });
}

async function checkSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  console.log("Sesión actual:", session);
}

checkSession();
