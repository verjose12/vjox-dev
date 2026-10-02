// helpers: funciones auxiliares..
function fileKey(f){ return [
    f.name, 
    f.size, 
    f.lastModified].join("::"); }

function mergeFiles(currentFiles, newFiles) {
    const fileMap = new Map(
      currentFiles.map(file => [fileKey(file), file])
    );
  
    for (const file of newFiles) {
      fileMap.set(fileKey(file), file);
    }
  
    return Array.from(fileMap.values());
  }

/** Compresión básica de imagen para móviles */
function compressImage(file, maxSize=1600, quality=0.85){
    return new Promise((resolve,reject)=>{
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        canvas.toBlob((blob)=>{
          if(!blob) return reject(new Error("No se pudo comprimir"));
          resolve(new File([blob], file.name, {type: blob.type}));
        }, "image/jpeg", quality);
      };
      img.onerror = reject;
      const reader = new FileReader();
      reader.onload = e => img.src = e.target.result;
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }