# CHANGELOG

Todas las modificaciones importantes de **VJOX Ventas** serán documentadas en este archivo.

Este proyecto sigue una estrategia de versionado basada en **Semantic Versioning (MAJOR.MINOR.PATCH)**.

---

# [3.0.0] - 2026-07-31

## 🎉 Inicio de la etapa profesional del proyecto

Esta versión marca la transición de un proyecto personal a un producto de software preparado para evolucionar como plataforma SaaS.

### Added

- Archivo `LICENSE.md` con licencia propietaria.
- Aviso de Copyright en la aplicación.
- Documentación inicial del proyecto.
- Base para futuras políticas de seguridad y documentación técnica.

### Changed

- Eliminación definitiva de dependencias de `localStorage`.
- Migración consolidada a Supabase como almacenamiento principal.
- Limpieza general del código.
- Preparación de la arquitectura para múltiples usuarios.

### Security

- Inicio de la protección legal y documental del proyecto.
- Definición del modelo de software propietario.
- Organización del proyecto para futuras versiones comerciales.

---

# [2.0.0]

## 🚀 Rediseño y modernización

### Added

- Conversión a Progressive Web App (PWA).
- Instalación en dispositivos Android.
- Nuevo diseño visual.
- Integración con Supabase.
- Gestión de inventario desde la nube.
- Publicación automática en Facebook mediante Meta Graph API.
- Mejoras en la visualización de galerías.
- Optimización del flujo de publicación.

### Changed

- Rediseño completo de la interfaz, modal, navegacion entre galerias, etc.
- Mejor organización del código JavaScript.
- Optimización de carga de imágenes.

---

# [1.0.0]

## 🎉 Primera versión funcional

### Added

- Creación inicial de VJOX Ventas.
- Catálogo de productos.
- Integración con Cloudinary.
- Compartir productos mediante WhatsApp.
- Galerías públicas para clientes.
- Gestión básica de inventario.
- Primer despliegue mediante GitHub Pages.

---

# Próximas versiones

## v3.1.0

# [3.1.0] - En desarrollo

## 🚧 Reestructuración de la interfaz

### Added

- Se inició la separación de la aplicación en múltiples pantallas.
- Se creó `add-product.html` como vista independiente para el registro de productos.
- Se agregó un acceso directo desde el inventario para registrar nuevos productos.

### Changed

- `index.html` comenzó a enfocarse exclusivamente en la administración del inventario.
- Se inició la reorganización de la navegación para preparar una experiencia más cercana a una aplicación móvil.
- Se estableció la base para futuras vistas independientes (Estadísticas, Configuración y Más).

### Planned

- Regresar automáticamente al inventario después de guardar un producto.
- Incorporar navegación inferior entre pantallas.
- Implementar botón flotante para las acciones principales.

## v3.2.8 
📌 Separación de Inventario y Agregar Producto
- add-product.html
- add_product.js
- Nueva navegación entre vistas
- Refactorización de la arquitectura
-  UX/UI
- Buscador
- Botón flotante
- Responsive
- Dashboard
- add-tarjetas resumen y funcion
- Tarjeta V4, iconos en tarjeta

## [3.2.9] - 2026-08-03

### Added
- Menú lateral deslizante (Side Drawer).
- Overlay para bloquear la interfaz al abrir el menú.
- Apertura y cierre mediante botón.
- Cierre al hacer clic fuera del menú.
- Cierre con la tecla Escape.
- Bloqueo del scroll mientras el menú está abierto.

## v3.3.0   
- Sistema de autenticación.
- Registro de usuarios.
- Roles.
- Configuración inicial del negocio.

---

## VJOX v4.0.0  - 2026-09-01  ← ESTA

Nueva arquitectura multiusuario y sistema de autenticación.

Cambios principales:

- Implementación de Supabase Auth.
- Registro de nuevos usuarios.
- Inicio de sesión con correo y contraseña.
- Confirmación de correo electrónico.
- Cierre de sesión.
- Protección de vistas privadas mediante auth guard.

- Implementación inicial de arquitectura multiusuario.
- Cada producto ahora se relaciona con su propietario mediante user_id.
- Cada usuario visualiza únicamente su propio inventario.
- Cada usuario puede agregar sus propios productos.
- Galerías públicas separadas por usuario.
- Los enlaces de galería ahora identifican al propietario del catálogo.

- Configuración de Row Level Security (RLS) en Supabase.
- Políticas para creación, actualización y eliminación de productos por propietario.
- Lectura pública de productos para permitir las galerías compartidas.

- Creación de entorno de desarrollo independiente:
  - Supabase Production: vjox-ventas
  - Supabase Development: vjox-dev
- Separación del desarrollo multiusuario de la base de datos de producción.

- Corrección del esquema de products en DEV.
- user_id migrado a UUID.
- id configurado como Identity/autoincremental.
- Restauración de created_at automático.
- Corrección de permisos y grants para authenticated y anon.

- Implementación y organización del nuevo Design System de VJOX.
- Separación de estilos base, formularios, botones, tarjetas, variables y utilidades.
- Preparación de una base visual reutilizable para las nuevas vistas.

Estado actual:

✓ Registro funciona
✓ Confirmación de correo funciona
✓ Login funciona
✓ Logout funciona
✓ Auth Guard funciona
✓ Productos asociados por usuario
✓ Inventario independiente por usuario
✓ Alta de productos independiente por usuario
✓ Galería pública independiente por usuario

## [4.1.0] - 2026-09-01

### Perfiles y WhatsApp multiusuario

- Se agregó la configuración inicial del perfil del vendedor.
- Cada usuario puede registrar:
  - Nombre.
  - Nombre del negocio.
  - Número de WhatsApp.
- Se agregó la tabla `profiles` relacionada con el usuario autenticado mediante su UUID.
- Se implementaron políticas RLS para proteger los perfiles de usuario.
- Se agregó `public_profiles` para consultar únicamente la información necesaria del vendedor desde la galería pública.
- La galería ahora identifica al propietario mediante el parámetro `user` de la URL.
- El botón **"Me interesa este producto"** dejó de utilizar un número de WhatsApp fijo.
- El contacto de WhatsApp ahora se obtiene dinámicamente desde el perfil del propietario de la galería.
- Los números mexicanos de 10 dígitos se convierten automáticamente al formato internacional `52XXXXXXXXXX`.
- Se corrigió la navegación entre productos para conservar el `userId` del vendedor.

### Cloudinary multiusuario

- Se eliminó el uso de una carpeta fija para todas las imágenes de productos.
- Las imágenes ahora se organizan automáticamente por usuario utilizando su UUID.
- Nueva estructura de almacenamiento:

  `vjox/users/{userId}/products`

- La sesión del usuario ahora se valida antes de iniciar la carga de imágenes.
- `uploadImageToCloudinary()` recibe el `userId` para determinar dinámicamente la carpeta de destino.
- Se configuró Cloudinary para utilizar `asset_folder` durante la carga.
- La organización de imágenes queda preparada para facilitar la administración de archivos por usuario.

Pendiente para siguientes versiones:

- Integración de Facebook por usuario.
- Login con Google.
- Recuperación de contraseña.
- Configuración/edición de perfil.
- Métricas y estadísticas multiusuario.


## [4.2.0] - 2026-09-03

### Facebook Multiusuario

Se completó la primera integración multiusuario de Facebook en VJOX, permitiendo que cada usuario pueda vincular su propia página y publicar productos desde la aplicación.

### Agregado
- Integración de Facebook Login mediante OAuth de Meta.
- Flujo para conectar una página de Facebook durante la configuración del perfil.
- Asociación de la conexión de Facebook con el usuario autenticado de VJOX.
- Soporte para usuarios que administran una sola página de Facebook.
- Selección de página cuando una cuenta administra múltiples páginas.
- Nueva tabla `facebook_connections` para almacenar las conexiones de Facebook por usuario.
- Nueva tabla `facebook_pending_pages` para manejar temporalmente la selección entre múltiples páginas.
- Edge Functions para iniciar y completar el proceso OAuth con Meta.
- Edge Function para consultar páginas pendientes.
- Edge Function para seleccionar y guardar la página elegida.
- Edge Function para consultar de forma segura el nombre de la página conectada.
- Publicación directa de productos desde VJOX hacia la página de Facebook correspondiente al usuario.
- Indicador de carga durante el proceso de publicación en Facebook.
- Mensajes visuales de confirmación al completar la conexión con Facebook.
- Nombre dinámico del negocio en el menú lateral:
  - muestra el nombre de la página de Facebook cuando existe una conexión;
  - utiliza el nombre del negocio como respaldo;
  - utiliza el nombre del usuario como segundo respaldo.

### Seguridad
- Los `Page Access Tokens` de Facebook permanecen exclusivamente en backend.
- Los tokens no son enviados ni expuestos al navegador.
- Las tablas que contienen credenciales de Facebook no son accesibles directamente por usuarios `anon` o `authenticated`.
- Las operaciones sensibles utilizan credenciales de servicio únicamente dentro de Supabase Edge Functions.
- Cada conexión de Facebook se identifica mediante el `user_id` del usuario autenticado.
- Se agregó validación de sesión antes de consultar, seleccionar o utilizar una conexión de Facebook.
- El flujo OAuth utiliza un `state` firmado y con expiración para vincular de forma segura la autorización de Meta con el usuario que inició el proceso.
- La selección de páginas múltiples valida tanto el usuario autenticado como la página seleccionada antes de guardar la conexión.

### Mejorado
- El onboarding permite continuar utilizando VJOX sin conectar Facebook, ya que la integración es opcional.
- Si Meta devuelve una sola página, VJOX la conecta automáticamente.
- Si Meta devuelve varias páginas, VJOX muestra un selector para que el usuario elija cuál desea utilizar.
- Se reemplazaron respuestas técnicas del flujo OAuth por redirecciones y mensajes integrados en la interfaz de VJOX.
- Se eliminó el `alert()` del flujo final de selección de página y se sustituyó por un modal de confirmación.
- Los nombres de páginas obtenidos desde Facebook se insertan mediante `textContent` para evitar interpretar contenido externo como HTML.
- El menú lateral ahora refleja la identidad del negocio o página conectada del usuario.

### Pruebas
- Conexión OAuth probada correctamente con Meta.
- Publicación real desde VJOX hacia una página de Facebook verificada.
- Aislamiento probado entre usuarios con y sin conexión de Facebook.
- Flujo de una sola página probado correctamente.
- Flujo de múltiples páginas probado mediante páginas simuladas.
- Selección y almacenamiento de la página elegida verificados.
- Limpieza de páginas pendientes después de completar la selección verificada.
- Visualización dinámica del nombre de la página conectada en el menú lateral verificada.

Resumen
- Facebook por usuario.
- Configuración individual de páginas.
- Tokens independientes.

---

## v4.5.0

Planeado

- Dashboard.
- Reportes.
- Estadísticas.
- Inventario avanzado.

---

## [4.2.1] - 2026-09

### Mejorado

- Se mejoró el flujo de confirmación de correo electrónico.
- Se agregó la opción para reenviar el correo de confirmación.
- Se mejoró el manejo del proceso de activación de nuevas cuentas.


---

## [4.2.2] - 2026-09

### Mejorado

- Se mejoró el formulario para agregar inventario.
- Se optimizó el manejo de productos con precio general y precios diferentes por fotografía.
- Se mejoró el manejo de stock y cantidades de productos.
- Se actualizaron los iconos de instalación de la PWA.
- Se agregaron versiones `maskable` de los iconos para mejorar su visualización en dispositivos móviles.
- Se corrigió la integración del `manifest.json` en las pantallas de inicio de sesión y registro.
- Se mejoró la experiencia de instalación de VJOX como PWA.

## [4.2.3] - 2026-09-18

### Mejorado

- Se mejoró el flujo para agregar nuevos productos desde la edición de un inventario existente.
- Las nuevas fotografías permiten definir precio y cantidad antes de agregarse.
- El precio general del inventario se utiliza como valor inicial cuando existe.
- Se agregó soporte para cantidades independientes por fotografía.
- Se corrigió el cálculo del stock total al agregar nuevas unidades.
- Se agregó previsualización de las nuevas fotografías antes de guardarlas.
- Se agregó la opción de quitar fotografías seleccionadas antes de subirlas.
- Se mejoró visualmente la interfaz de las nuevas fotografías con campos de precio y cantidad.
- Los nuevos precios, cantidades y fotografías se almacenan correctamente y permanecen sincronizados con el inventario.

---

## v5.0.0

Planeado

- Sistema SaaS.
- Suscripciones.
- Pagos.
- Planes.
- Multiempresa.