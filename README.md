# VJOX Ventas

> **Catálogo inteligente e inventario para pequeños negocios.**

VJOX Ventas es una Progressive Web App (PWA) diseñada para facilitar la publicación, organización y administración de productos para vendedores independientes y pequeños comercios.

Su objetivo es reducir el tiempo que un vendedor dedica a preparar publicaciones, administrar inventario, permitiéndole concentrarse en vender.

---

# Estado del proyecto

**Versión:** 4.7.0

**Estado:** En desarrollo activo.

Actualmente el proyecto se encuentra en una etapa de profesionalización, preparando la arquitectura para convertirse en una plataforma SaaS (Software as a Service).

---

# Características actuales

* Gestión de inventario de productos.
* Gestión de propiedades para asesores inmobiliarios.
* Experiencia adaptada según el giro del negocio.
* Carga y administración de imágenes mediante Cloudinary.
* Base de datos y autenticación mediante Supabase.
* Arquitectura multiusuario con información independiente por usuario.
* Galerías públicas para productos y propiedades.
* Compartir productos mediante WhatsApp.
* Conexión y publicación de productos en Facebook mediante Meta Graph API.
* Recuperación de contraseña mediante correo electrónico.
* Correos de autenticación enviados mediante SMTP personalizado con Resend.
* Progressive Web App (PWA).
* Diseño adaptable para dispositivos móviles.
* Generación de QR promocional permanente por vendedor.
* Landing pública para acceso al catálogo mediante QR.
* Estadísticas de visitas, escaneos QR y enlaces compartidos.
* Generación de material promocional descargable para impresión.

* Periodo de prueba gratuito de 7 días para nuevas cuentas.
* Sistema de suscripciones con control automático de vigencia.
* Planes diferenciados para Productos e Inmobiliaria.
* Renovación de suscripción mediante contacto por WhatsApp.



## v4.0.0

- Autenticación con Supabase
- Registro e inicio de sesión
- Confirmación de correo
- Cierre de sesión
- Protección de rutas
- Arquitectura multiusuario
- Inventario independiente por usuario
- Galerías públicas por vendedor
- Row Level Security
- Nuevo Design System

## v4.1.0

- 👤 Perfiles independientes por vendedor.
- 💬 Contacto por WhatsApp personalizado por usuario.
- 🖼️ Galerías públicas independientes.
- ☁️ Organización de imágenes por usuario en Cloudinary.

## Versión: 4.2.3

- 🔵 Integración multiusuario con Facebook.
- 🔐 Conexión segura mediante Meta OAuth.
- 📄 Detección de páginas administradas por cada usuario.
- 🔀 Selección de página para usuarios con múltiples páginas.
- 🚀 Publicación directa de productos en la página de Facebook conectada.
- 👤 Conexiones de Facebook independientes por usuario.
- 🏪 Visualización del nombre de la página conectada dentro de VJOX.
- 🔒 Page Access Tokens protegidos y utilizados exclusivamente desde el backend.


## Versión: 4.3.0

- 🔳 Generación de códigos QR promocionales por usuario.
- 🔗 Enlace permanente asociado al catálogo del vendedor.
- 📱 Landing pública para visitantes provenientes del QR.
- 🖨️ Generación de material promocional descargable en PNG.
- 📤 Opciones para copiar y compartir el enlace promocional.
- 🛡️ Fallback visual cuando las APIs de copiar o compartir no están disponibles.
- 📦 QRCode.js integrado localmente como dependencia de terceros.



###  Versión: 4.4.0 📊 Estadísticas del catálogo

VJOX incluye métricas para conocer cómo interactúan los clientes con el catálogo público.

- Visitas al catálogo.
- Escaneos del QR promocional.
- Entradas al catálogo desde QR.
- Visitas provenientes de enlaces compartidos.
- Uso de la función "Compartir catálogo".
- Visitas directas.
- Conversión del QR.

Las estadísticas se registran por usuario y se muestran desde el panel de VJOX.


## Versión: 4.5.0 📘 Integración de Facebook

VJOX mejora la integración con Facebook para permitir que cada vendedor administre su conexión y publique productos directamente desde su inventario.

- 🔵 Conexión de Facebook desde el menú principal.
- 🔐 Integración segura mediante Meta OAuth.
- 📄 Detección automática de páginas administradas por el usuario.
- 🔀 Selector de página cuando el usuario administra múltiples páginas.
- 👤 Conexión independiente de Facebook por usuario.
- ⚙️ Administración y desconexión de la página vinculada.
- 🛍️ Publicación directa desde el botón de Facebook de cada producto.
- 👁️ Vista previa del producto antes de publicar.
- 💰 Soporte para precio único, múltiples precios y productos sin precio.
- 🖼️ Publicación con imagen, descripción y enlace a la galería pública.
- 🎨 Integración completa con el Design System de VJOX.



## Versión: 4.6.0 🏠 Inmobiliaria y recuperación de cuenta

VJOX amplía su funcionamiento para adaptarse a diferentes giros de negocio e incorpora una primera versión funcional para asesores inmobiliarios.

### 🏠 Módulo inmobiliario

- Selección del giro del negocio.
- Nuevo panel para administración de propiedades.
- Registro de propiedades con información y fotografías.
- Galería pública adaptada para propiedades.
- Visualización del nombre de la propiedad en la galería.
- Soporte para ubicación de propiedades.
- Diseño integrado con la identidad visual de VJOX.

### 🔐 Autenticación y recuperación de cuenta

- Recuperación de contraseña desde el inicio de sesión.
- Envío de enlaces de recuperación por correo electrónico.
- Creación de una nueva contraseña mediante enlace seguro.
- Manejo de enlaces expirados o utilizados.
- Manejo de límites de solicitudes de recuperación.
- Mensajes de autenticación más claros para el usuario.
- Opción para mostrar u ocultar la contraseña.
- SMTP personalizado mediante Resend y Supabase Auth.
- Envío de correos utilizando el dominio `vjox.com.mx`.


## Versión: 4.6.3 💬 Compartir propiedades

- Contacto directo con la asesora mediante WhatsApp desde la vista de propiedad.
- Número de WhatsApp obtenido dinámicamente desde el perfil del usuario.
- Compartir propiedades por WhatsApp desde el panel inmobiliario.
- Mensajes con operación, precio, ubicación y enlace directo a la propiedad.
- Separación de la lógica de compartir en `real-estate/js/share.js`.

## Versión: 4.7.0 💳 Suscripciones

VJOX incorpora su primera versión funcional del sistema de suscripciones y comienza la etapa de comercialización de la plataforma.

- Periodo de prueba gratuito de 7 días.
- Control de acceso mediante fecha de vencimiento.
- Protección automática de vistas privadas al finalizar la prueba o suscripción.
- Conservación de productos, propiedades y datos después del vencimiento.
- VJOX Productos: $350 MXN al mes.
- VJOX Inmobiliario: $800 MXN al mes.
- Renovación mediante contacto directo por WhatsApp.
- Reactivación de cuentas mediante suscripción vigente.
- Cuentas beta excluidas de expiración.

## Versión: 4.7.1 ✨ Mejoras de interfaz y navegación

- Cierre automático del menú lateral al seleccionar una opción.
- Mejoras de navegación compartidas entre Productos e Inmobiliaria.
- Opción para cancelar el registro de una propiedad.
- Diferenciación visual entre agregar y editar propiedades.
- Botón **Guardar cambios** durante la edición de propiedades.
- Mayor consistencia visual entre los formularios de VJOX.


---


# Tecnologías utilizadas

## Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

## Backend y servicios

* Supabase
* Supabase Edge Functions
* Cloudinary
* Meta Graph API
* Facebook Login / OAuth
* Resend

## Herramientas

* Git
* GitHub
* GitHub Pages
* Visual Studio Code

---

# Objetivo del proyecto

VJOX Ventas nace con la intención de ofrecer una solución sencilla para vendedores que publican constantemente productos en redes sociales.

El objetivo a largo plazo es evolucionar hacia una plataforma SaaS que permita a múltiples negocios administrar su inventario, compartir catálogos y automatizar publicaciones desde una sola aplicación.

---

# Hoja de ruta

## Próximas mejoras

* Mejoras del módulo inmobiliario.
* Dashboard y reportes avanzados.
* Automatización de pagos y renovaciones.
* Funciones premium.
* Mejoras de inventario.
* Evolución de la plataforma SaaS.

---

# Licencia

Este proyecto es **software propietario**.

El código fuente, diseño, documentación y funcionalidades pertenecen exclusivamente a su autora.

Consulta el archivo **LICENSE.md** para conocer los términos completos de uso.

---

# Historial de versiones

Las modificaciones importantes del proyecto se documentan en el archivo **CHANGELOG.md**.

---

# Autora

**Verónica J. Narciso**

Desarrolladora Full Stack

Ciudad Juárez, Chihuahua, México

---

© 2026 VJOX Ventas. Todos los derechos reservados.
