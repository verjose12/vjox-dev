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
          data: {
            name
          }
        }
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

    const email = document
      .querySelector("#loginEmail")
      .value
      .trim();

    const password =
      document.querySelector("#loginPassword").value;

    const status =
      document.querySelector("#loginStatus");

    status.textContent = "Iniciando sesión...";

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

/*     if (error) {
      console.error(error);
      status.textContent = error.message;
      return;
    } */

    if (error) {
      console.error(error);
    
      if (error.message === "Email not confirmed") {
        status.innerHTML = `
          Tu correo aún no ha sido confirmado.<br><br>
          <button type="button" id="resendConfirmationBtn">
            Reenviar correo de confirmación
          </button>
        `;
    
        const resendBtn =
          document.querySelector("#resendConfirmationBtn");
    
        resendBtn.addEventListener("click", async () => {
          resendBtn.disabled = true;
          resendBtn.textContent = "Enviando...";
    
          const { error: resendError } =
            await supabaseClient.auth.resend({
              type: "signup",
              email
            });
    
          if (resendError) {
            console.error("Error reenviando correo:", resendError);
    
            status.textContent =
              `Error: ${resendError.message}`;
    
            return;
          }
    
          status.textContent =
            "Correo de confirmación reenviado. Revisa tu bandeja de entrada.";
        });
    
        return;
      }
    
      status.textContent = error.message;
      return;
    }

    console.log("Sesión iniciada:", data);

    status.textContent =
      "Sesión iniciada correctamente.";
    
    const user = data.user;
    
    const profile = await getProfile(user.id);
    
    setTimeout(() => {
      if (profile) {
        window.location.href = "../index.html";
      } else {
        window.location.href = "../profiles-setup.html";
      }
    }, 800);
  });
}

async function checkSession() {
    const {
      data: { session }
    } = await supabaseClient.auth.getSession();
  
    console.log("Sesión actual:", session);
  }
  
  checkSession();