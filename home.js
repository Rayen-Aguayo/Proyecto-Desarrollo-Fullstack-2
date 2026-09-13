/* ============================================================
   home.js
   Llena el panel de inicio (home.html) con datos reales,
   leídos desde db.js (localStorage): tarjetas de estadísticas
   y la tabla de "Productos con stock bajo".
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderizarEstadisticas();
  renderizarTablaStockCritico();
});

/* Llena las 4 tarjetas de arriba: Productos, Usuarios,
   Stock crítico y Categorías. */
function renderizarEstadisticas() {
  const productos = dbObtenerProductos();

  const totalProductos = productos.length;

  const totalStockCritico = productos.filter(
    (p) => dbObtenerEstadoProducto(p).texto !== 'Disponible'
  ).length;

  const totalCategorias = dbObtenerCategorias().length;

  // Usuarios: si más adelante existe db.js con dbObtenerUsuarios(),
  // se usa esa función; si todavía no existe, se muestra 0
  // en vez de romper la página.
  const totalUsuarios =
    typeof dbObtenerUsuarios === 'function' ? dbObtenerUsuarios().length : 0;

  actualizarTexto('jsStatProductos', totalProductos);
  actualizarTexto('jsStatUsuarios', totalUsuarios);
  actualizarTexto('jsStatStockCritico', totalStockCritico);
  actualizarTexto('jsStatCategorias', totalCategorias);
}

/* Llena la tabla "Productos con stock bajo" con los productos
   cuyo estado sea "Stock bajo" o "Stock crítico" (todo lo que
   no sea "Disponible"). Si no hay ninguno, muestra el mensaje
   de "sin alertas". */
function renderizarTablaStockCritico() {
  const tbody = document.getElementById('jsTablaStockCritico');
  const mensajeSinAlertas = document.getElementById('jsSinAlertas');
  if (!tbody) return;

  const productos = dbObtenerProductos();

  const productosEnAlerta = productos
    .map((p) => ({ producto: p, estado: dbObtenerEstadoProducto(p) }))
    .filter((item) => item.estado.texto !== 'Disponible')
    // primero los más urgentes (Stock crítico antes que Stock bajo)
    .sort((a, b) => {
      if (a.estado.texto === b.estado.texto) return 0;
      return a.estado.texto === 'Stock crítico' ? -1 : 1;
    });

  tbody.innerHTML = '';

  if (productosEnAlerta.length === 0) {
    if (mensajeSinAlertas) mensajeSinAlertas.style.display = 'block';
    return;
  }

  if (mensajeSinAlertas) mensajeSinAlertas.style.display = 'none';

  productosEnAlerta.forEach(({ producto, estado }) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${escaparHtmlHome(producto.nombre)}</td>
      <td>${escaparHtmlHome(producto.categoria)}</td>
      <td>${producto.stock} <span class="badge ${estado.clase} ms-1">${estado.texto}</span></td>
      <td>${producto.stockCritico}</td>
    `;
    tbody.appendChild(fila);
  });
}

/* Utilidades locales */
function actualizarTexto(idElemento, valor) {
  const el = document.getElementById(idElemento);
  if (el) el.textContent = valor;
}

function escaparHtmlHome(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}
