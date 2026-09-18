const state ={
    files: [],
  };
  
  const $ = s => document.querySelector(s);
  
  const fileInput = $("#fileInput");
  const titleInput = $("#titleInput");
  const priceInput = $("#priceInput");
  const descInput = $("#descInput");
  const uploadBtn = $("#uploadBtn");
  const clearBtn = $("#clearBtn");
  const preview = $("#preview");
  const statusEl = $("#status");
  const perPhotoChk = $("#perPhotoChk");
  const stockInput = $("#stockInput");
  const categoryInput = $("#categoryInput");
  
  
  
  function formatPrice(n){
    if(n==null || n==="") return "";
    const v = Number(n);
    try { return v.toLocaleString("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:2}); }
    catch { return `MXN ${v.toFixed(2)}`; }
  }
  
  // function rebuildPreview(){
  //   preview.innerHTML = "";
  //   for (let i=0;i<state.files.length;i++){
  //     const f = state.files[i];
  //     const url = URL.createObjectURL(f);
  //     const el = document.createElement("div");
  //     el.className = "thumb";
  //     el.innerHTML = `
  //       <img src="${url}" alt="">
  //       <div class="priceTag">Previsualización</div>
  //       ${perPhotoChk.checked ? `
  //         <div style="
  //         position:absolute;
  //         top:8px;
  //         left:8px;
  //         right:8px;
  //         background:rgba(0,0,0,.55);
  //         padding:6px;
  //         border-radius:8px
  //         ">
  //         <input 
  //             data-idx="${i}" 
  //             class="pp" 
  //             type="number" 
  //             inputmode="decimal" 
  //             min="0" 
  //             step="0.01" 
  //             value="${priceInput.value || ""}" 
  //             placeholder="Precio para esta foto" 
  //             style="
  //             width:100%;
  //             border:1px solid #444;
  //             background:#111;color:#fff;
  //             padding:6px;
  //             border-radius:6px;
  //             font-size:12px
  //             margin-bottom:6px;
  //             "
  //         >

  //      <input
  //       data-idx="${i}"
  //       class="ps"
  //       type="number"
  //       inputmode="numeric"
  //       min="1"
  //       step="1"
  //       value="1"
  //       placeholder="Cantidad"
  //       style="
  //         width:100%;
  //         border:1px solid #444;
  //         background:#111;
  //         color:#fff;
  //         padding:6px;
  //         border-radius:6px;
  //         font-size:12px;
  //       "
  //     >

  //         </div>
  //         ` : ``}
  //     `;
  //     preview.appendChild(el);
  //   }
  // }

  function rebuildPreview() {
    preview.innerHTML = "";
  
    for (let i = 0; i < state.files.length; i++) {
      const f = state.files[i];
      const url = URL.createObjectURL(f);
      const el = document.createElement("div");
  
      el.className = "thumb";
  
      el.innerHTML = `
        <img src="${url}" alt="">

        <button
            type="button"
            class="remove-preview-photo"
            data-idx="${i}"
            aria-label="Eliminar fotografía"
        >
          ×
        </button>
  
        ${
          perPhotoChk.checked
            ? `
              <div class="photo-data">
  
                <label>
                  <span>Precio</span>
                  <input
                    data-idx="${i}"
                    class="pp"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="0.01"
                    value="${priceInput.value || ""}"
                    placeholder="$"
                  >
                </label>
  
                <label>
                  <span>Cant.</span>
                  <input
                    data-idx="${i}"
                    class="ps"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    step="1"
                    value="1"
                  >
                </label>
  
              </div>
            `
            : `
              <div class="priceTag">Previsualización</div>
            `
        }
      `;
  
      preview.appendChild(el);
    }

    updateStockFromPhotos();

  }

  function updateStockFromPhotos() {
    if (!perPhotoChk.checked) return;
  
    const stockInputs = preview.querySelectorAll(".ps");
  
    const totalStock = [...stockInputs].reduce((total, input) => {
      return total + (Number(input.value) || 0);
    }, 0);
  
    stockInput.value = totalStock;
  }

  preview.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-preview-photo");
  
    if (!removeBtn) return;
  
    const index = Number(removeBtn.dataset.idx);
  
    state.files.splice(index, 1);
  
    rebuildPreview();
  });


// ESCUCHA CUANDO CAMBIAMOS UNA CANTIDAD
  preview.addEventListener("input", (e) => {

    if (e.target.classList.contains("ps")) {
      updateStockFromPhotos();
    }

  });
    
  fileInput.addEventListener("change", (e)=>{
    const picked = Array.from(e.target.files || []);
    if(picked.length === 0) return;
    state.files = mergeFiles( // <-usamos el helper para acumular
      state.files,
      picked
    );    
    fileInput.value = ""; // <-permite volver a elegir los mismos archivos
    rebuildPreview();
  });
  
  
  // si cambias el checkbox, vuelve a dibujar inputs por foto
  // perPhotoChk.addEventListener("change", rebuildPreview);
  perPhotoChk.addEventListener("change", () => {
    stockInput.readOnly = perPhotoChk.checked;
  
    rebuildPreview();
  });
  
  // Lee precios por foto antes de subir
  function getPerPhotoPrices(){
    const map = {};
    document.querySelectorAll("input.pp").forEach(inp=>{
      map[Number(inp.dataset.idx)] = inp.value.trim();
    });
    return map;
  }

  function getPerPhotoStock() {
    const inputs = preview.querySelectorAll(".ps");
    const stockMap = {};
  
    inputs.forEach(input => {
      const idx = Number(input.dataset.idx);
      stockMap[idx] = Number(input.value) || 1;
    });
  
    return stockMap;
  }
  
  clearBtn.addEventListener("click", ()=>{
    state.files = [];
    fileInput.value = "";
    preview.innerHTML = "";
    titleInput.value = "";
    priceInput.value = "";
    descInput.value = "";
    stockInput.value = "";
    categoryInput.value = "";
    setStatus("");
  });
  
  uploadBtn.addEventListener("click", async ()=>{
    const title = titleInput.value.trim() || "Producto";
    const price = priceInput.value.trim();
    const desc  = descInput.value.trim();
    const stock = stockInput.value.trim();
    const category = categoryInput.value;
    const perPhoto = perPhotoChk.checked;
    const ppMap = perPhoto ? getPerPhotoPrices() : {};
    const stockMap = perPhoto ? getPerPhotoStock() : {};

    if (perPhoto && !price) {
      const missingPrice = state.files.some((_, i) => !ppMap[i]);
    
      if (missingPrice) {
        return setStatus(
          "Agrega el precio de cada producto 💵",
          true
        );
      }
    }
  
    if(state.files.length === 0){ return setStatus("Sube al menos una foto 🖼️", true); }
    // if(!price){ return setStatus("Agrega un precio 💵", true); }
    if (!stock) {
      return setStatus("Agrega la cantidad disponible 📦", true);
    }
    const {
      data: { session }
    } = await supabaseClient.auth.getSession();
    
    if (!session) {
      return setStatus(
        "Debes iniciar sesión.",
        true
      );
    }
    
    const userId = session.user.id;

    setStatus("Subiendo fotos… 📤 Esto puede tardar unos segundos.");
    try{
      // const urls = [], perPhotoPrices = [];
      const urls = [], perPhotoPrices = [], perPhotoStock = [];
      for(let i=0;i<state.files.length;i++){
        const file = state.files[i];                                   // <-- corregido
        const compressed = await compressImage(file, 1600, 0.85);
        // const delivered = 
        //   await uploadImageToCloudinary(compressed);
        const delivered =
          await uploadImageToCloudinary(
            compressed, userId);
        urls.push(delivered);
        perPhotoPrices.push(perPhoto ? (ppMap[i] || price) : null);

        perPhotoStock.push(
          perPhoto ? (stockMap[i] || 1) : null
        );
      }

      

      // const {
      //   data: { session }
      // } = await supabaseClient.auth.getSession();
    
      // if (!session) {
      //   return setStatus(
      //     "Debes iniciar sesión.",
      //     true
      //   );
      // }
  
      const productToSave = {
        title: title,
        // price: Number(price),
        price: price === "" ? null : Number(price),
        description: desc,
        image_urls: urls,
        per_photo: perPhoto,
        per_photo_prices: perPhotoPrices,
        per_photo_stock: perPhotoStock,
        stock: Number(stock),
        category: category || null,

        // user_id: session.user.id
        user_id: userId
      };
      
      const savedProduct = await saveProduct(productToSave);
      
      if (!savedProduct) {
        throw new Error("No se pudo guardar el producto en Supabase");
      }
  
      setStatus(
        `Producto agregado correctamente ✔️`,
        false
      );
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);

  
      // refresca miniaturas con el precio correcto
      preview.innerHTML = "";
      urls.forEach((u,idx)=>{
        const el = document.createElement("div");
        el.className = "thumb";
        const tagPrice = perPhoto ? perPhotoPrices[idx] : price;
        el.innerHTML = `<img src="${u}" alt=""><div class="priceTag">${formatPrice(tagPrice)}</div>`;
        preview.appendChild(el);
      });
    /* }catch(err){
      console.error(err);
      setStatus("Error subiendo. Revisa tu CLOUD_NAME y UPLOAD_PRESET.", true);
    } */
      }catch(err){
        console.error("Error completo:", err);
        setStatus(`Error: ${err.message}`, true);
    }
  });


  function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = isError
      ? "muted bad"
      : "muted ok";
  }
  
  