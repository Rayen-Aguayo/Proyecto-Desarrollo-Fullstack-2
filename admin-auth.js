/* =========================================================
   admin-auth.js — Protección de acceso + permisos por rol
   Se incluye en TODAS las páginas de admin/, después de db.js
   ========================================================= */

(function () {
  const sesion = obtenerSesion();

  // Sin sesión, o sesión de Cliente -> fuera del panel admin
  if (!sesion || sesion.tipoUsuario === "Cliente") {
    window.location.href = "../login.html";
  }
})();

// Ítems del sidebar que el rol "Vendedor" NO debe ver
// (el PDF: el Vendedor solo ve listado/detalle de productos y de órdenes)
const RUTAS_SOLO_ADMIN = ["usuarios.html", "usuario-form.html"];

function aplicarPermisosSidebar() {
  const sesion = obtenerSesion();
  if (!sesion) return;

  document.querySelectorAll(".admin-nav .nav-link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const esRutaAdmin = RUTAS_SOLO_ADMIN.some((r) => href.includes(r));
    if (sesion.tipoUsuario === "Vendedor" && esRutaAdmin) {
      link.remove();
    }
  });

  const nombreEl = document.getElementById("jsSidebarUserName");
  const rolEl = document.getElementById("jsSidebarUserRole");
  if (nombreEl) nombreEl.textContent = `${sesion.nombre} ${sesion.apellidos || ""}`.trim();
  if (rolEl) rolEl.textContent = sesion.tipoUsuario;
}

function cerrarSesionYRedirigir() {
  cerrarSesion();
  window.location.href = "../login.html";
}
