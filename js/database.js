// const SUPABASE_URL = "https://hmdxqtcxsafqoympyttr.supabase.co";
const SUPABASE_URL = "https://efreukwqbvfzspdixcnz.supabase.co";
// const SUPABASE_KEY = "sb_publishable_l6yOXCyNUW9FSNOd7h6f5g_SeSI7aJD";
const SUPABASE_KEY = "sb_publishable_K-p3gI-Ej8NqWPHZh6_fJw_Mgxox1wD";


const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


async function saveProduct(product) {
    console.log("Producto que se enviará:", product);

    const { data, error } = await supabaseClient
      .from("products")
      .insert([product]) // para poder insertar en data base agregamos politicas de seguridad en supabase
      .select("*");// politica INSERT Y SELECT
  
    if (error) {
      console.error("Error en supabase:", error);
      return null;
    }
  
    console.log("Producto guardado en Supabase:", data);
    return data[0];
  }

  async function getProducts() {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error al obtener productos:", error);
      return [];
    }
  
    console.log("Productos obtenidos:", data);
    return data;
  }

  async function getMyProducts(userId) {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error(
        "Error al obtener productos del usuario:",
        error
      );
      return [];
    }
  
    console.log("Productos del usuario:", data);
    return data;
  }

  async function getProductById(productId) {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
  
    if (error) {
      console.error(error);
      return null;
    }
  
    return data;
  }

  async function deleteProduct(productId) {
    const { error } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", productId);
  
    if (error) {
      console.error("Error eliminando producto:", error);
      return false;
    }
  
    return true;
  }

  // async function updateProductPhotos(productId, imageUrls, newStock) {
    async function updateProductPhotos(
      productId,
      imageUrls,
      newStock,
      perPhotoPrices = null,
      perPhotoStock = null
    ) {
    const { data, error } = await supabaseClient
      .from("products")

      // .update({
      //   image_urls: imageUrls,
      //   stock: newStock
      // })
      .update({
        image_urls: imageUrls,
        stock: newStock,
        per_photo_prices: perPhotoPrices,
        per_photo_stock: perPhotoStock
      })
      .eq("id", productId)
      .select()
      .single();
  
    if (error) {
      console.error("Error actualizando producto:", error);
      return null;
    }
  
    return data;
  }


  async function getProductsByUser(userId) {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error(error);
      return [];
    }
  
    return data;
  }

//funsiones para profile-setup

  async function createProfile(profile) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .insert([profile])
      .select()
      .single();
  
    if (error) {
      console.error("Error creando perfil:", error);
      return null;
    }
  
    return data;
  }
  
  async function getProfile(userId) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
  
    if (error) {
      console.error("Error obteniendo perfil:", error);
      return null;
    }
  
    return data;
  }
  

  async function getPublicProfile(userId) {
    const { data, error } = await supabaseClient
      .from("public_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
  
    if (error) {
      console.error("Error obteniendo perfil público:", error);
      return null;
    }
  
    return data;
  }