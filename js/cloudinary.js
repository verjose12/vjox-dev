
const CLOUD_NAME = "dvxorpdrd";
const UPLOAD_PRESET = "Ventas";
const CLOUDINARY_BASE_FOLDER ="vjox/users";

async function uploadImageToCloudinary(
  file, 
  userId,  
  module = "products") {
  const form = new FormData();

  const userFolder=
  `${CLOUDINARY_BASE_FOLDER}/${userId}/${module}`;

  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("asset_folder", userFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: form
    }
  );

  if (!response.ok) {
    throw new Error("Fallo al subir imagen a Cloudinary");
  }

  const data = await response.json();

  return optimizeCloudinaryUrl(data.secure_url);
}

function optimizeCloudinaryUrl(url) {
  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto:eco,w_1200/"
  );
}
