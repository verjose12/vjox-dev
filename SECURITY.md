# SECURITY

## Política de Seguridad

La seguridad de VJOX Ventas es una prioridad. Este documento describe las prácticas utilizadas para proteger la aplicación, la información de los usuarios y las integraciones con servicios externos.

---

# Versiones soportadas

Actualmente únicamente se brinda soporte a la versión más reciente del proyecto.

| Versión | Soporte |
| ------- | ------- |
| 4.x.x   | ✅ Sí    |
| 3.x.x   | ❌ No    |
| 2.x.x   | ❌ No    |
| 1.x.x   | ❌ No    |

---

# Reporte de vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor **no la publiques de forma pública**.

Se agradece reportarla de manera responsable para poder investigarla y corregirla antes de divulgarla.

Mientras el proyecto se encuentra en desarrollo, los reportes serán atendidos directamente por la autora.

---

# Principios de seguridad

VJOX Ventas sigue los siguientes principios:

* Protección de la información de los usuarios.
* Mínimo acceso necesario a servicios externos.
* Uso de conexiones seguras mediante HTTPS.
* Separación entre frontend y servicios sensibles.
* Almacenamiento seguro de credenciales.
* Actualización continua de dependencias cuando sea necesario.

---

# Gestión de credenciales

Las siguientes credenciales **nunca deben almacenarse en el código del cliente**:

* Tokens privados de Meta.
* Service Role Key de Supabase.
* Secretos de Edge Functions.
* Claves privadas de terceros.

Las credenciales sensibles deberán almacenarse únicamente como variables de entorno o secretos del servidor.

---

# Protección de datos

La información de los usuarios será protegida mediante los mecanismos disponibles en la infraestructura utilizada.

Entre ellos:

* Autenticación mediante Supabase Auth.
* Row Level Security (RLS) para restringir el acceso a los datos de cada usuario.
* Acceso autenticado a recursos protegidos.
* Validaciones tanto en cliente como en servidor.

---

# Integraciones externas

Actualmente el proyecto utiliza los siguientes servicios:

* Supabase
* Cloudinary
* Meta Graph API
* GitHub Pages

Cada uno de estos servicios mantiene sus propias políticas de seguridad y privacidad.

---

# Buenas prácticas de desarrollo

Durante el desarrollo de VJOX Ventas se procura cumplir con las siguientes prácticas:

* No subir credenciales al repositorio.
* Revisar cambios antes de cada despliegue.
* Mantener el historial de versiones mediante Git.
* Documentar cambios importantes en CHANGELOG.md.
* Mantener actualizados los documentos oficiales del proyecto.
* Realizar respaldos periódicos del código fuente.

---

# Mejoras futuras

Conforme el proyecto evolucione se incorporarán medidas adicionales como:

* Autenticación multifactor (MFA).
* Registro de eventos de seguridad.
* Monitoreo de actividad.
* Auditoría de accesos.
* Cifrado de información sensible cuando sea necesario.
* Gestión de sesiones activas.
* Recuperación segura de cuentas.

---

# Contacto

Proyecto:

VJOX Ventas

Versión actual:

4.3.0

Última actualización:

24 de septiembre de 2026

# Autora

**Verónica J. Narciso**

---

© 2026 VJOX Ventas. Todos los derechos reservados.
