/* ============================================================
   productos.js
   Dibuja la tabla de "Stock de materias primas" en productos.html
   usando los datos guardados por db.js (localStorage), y permite
   agregar, editar y eliminar productos desde un formulario
   emergente propio (no depende del JS de Bootstrap).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderizarTablaProductos();

  const btnAgregar = document.getElementById('btnAgregarProducto');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => abrirFormularioProducto(null));
  }

  const tbody = document.getElementById('jsTablaProductos');
  if (tbody) {
    tbody.addEventListener('click', (evento) => {
      const btnEditar = evento.target.closest('[data-accion="editar"]');
      const btnEliminar = evento.target.closest('[data-accion="eliminar"]');

      if (btnEditar) {
        const id = Number(btnEditar.dataset.id);
        const producto = dbObtenerProductoPorId(id);
        if (producto) abrirFormularioProducto(producto);
      }

      if (btnEliminar) {
        const id = Number(btnEliminar.dataset.id);
        const producto = dbObtenerProductoPorId(id);
        const nombre = producto ? producto.nombre : 'este producto';
        if (confirm(`¿Eliminar "${nombre}" del inventario?`)) {
          dbEliminarProducto(id);
          renderizarTablaProductos();
        }
      }
    });
  }
});

/* Lee los productos desde db.js y reconstruye el <tbody>. */
function renderizarTablaProductos() {
  const tbody = document.getElementById('jsTablaProductos');
  if (!tbody) return;

  const productos = dbObtenerProductos();
  tbody.innerHTML = '';

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">No hay productos registrados.</td>
      </tr>`;
    return;
  }

  productos.forEach((producto) => {
    const estado = dbObtenerEstadoProducto(producto);

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${escaparHtml(producto.nombre)}</td>
      <td>${escaparHtml(producto.categoria)}</td>
      <td>${escaparHtml(producto.unidad)}</td>
      <td>${producto.stock}</td>
      <td>${producto.stockCritico}</td>
      <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary" type="button" title="Editar" data-accion="editar" data-id="${producto.id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" type="button" title="Eliminar" data-accion="eliminar" data-id="${producto.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

/* Evita que texto ingresado por el usuario rompa el HTML de la tabla. */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

/* ============================================================
   Formulario emergente (agregar / editar)
   Se construye con JS puro para no depender del bundle JS de
   Bootstrap. Si 'productoExistente' es null, es modo "agregar";
   si trae datos, es modo "editar".
   ============================================================ */
function abrirFormularioProducto(productoExistente) {
  cerrarFormularioProducto(); // por si quedó uno abierto

  const esEdicion = Boolean(productoExistente);
  const categoriasSugeridas = dbObtenerCategorias();

  const overlay = document.createElement('div');
  overlay.id = 'jsOverlayProducto';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1050; padding: 1rem;
  `;

  overlay.innerHTML = `
    <div style="background:#fff; border-radius:10px; width:100%; max-width:420px; padding:1.5rem; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
      <h4 class="mb-3">${esEdicion ? 'Editar producto' : 'Agregar producto'}</h4>
      <form id="jsFormProducto">
        <div class="mb-2">
          <label class="form-label">Producto</label>
          <input type="text" class="form-control" id="fpNombre" required
                 value="${esEdicion ? escaparHtml(productoExistente.nombre) : ''}">
        </div>
        <div class="mb-2">
          <label class="form-label">Categoría</label>
          <input type="text" class="form-control" id="fpCategoria" list="fpListaCategorias" required
                 value="${esEdicion ? escaparHtml(productoExistente.categoria) : ''}">
          <datalist id="fpListaCategorias">
            ${categoriasSugeridas.map((c) => `<option value="${escaparHtml(c)}">`).join('')}
          </datalist>
        </div>
        <div class="mb-2">
          <label class="form-label">Unidad</label>
          <input type="text" class="form-control" id="fpUnidad" placeholder="kg, litros, unidades..." required
                 value="${esEdicion ? escaparHtml(productoExistente.unidad) : ''}">
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Stock actual</label>
            <input type="number" min="0" step="1" class="form-control" id="fpStock" required
                   value="${esEdicion ? productoExistente.stock : ''}">
          </div>
          <div class="col-6">
            <label class="form-label">Stock crítico</label>
            <input type="number" min="0" step="1" class="form-control" id="fpStockCritico" required
                   value="${esEdicion ? productoExistente.stockCritico : ''}">
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" id="fpCancelar">Cancelar</button>
          <button type="submit" class="btn btn-primary">${esEdicion ? 'Guardar cambios' : 'Agregar'}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('fpCancelar').addEventListener('click', cerrarFormularioProducto);
  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) cerrarFormularioProducto();
  });

  document.getElementById('jsFormProducto').addEventListener('submit', (evento) => {
    evento.preventDefault();

    const datos = {
      nombre: document.getElementById('fpNombre').value.trim(),
      categoria: document.getElementById('fpCategoria').value.trim(),
      unidad: document.getElementById('fpUnidad').value.trim(),
      stock: document.getElementById('fpStock').value,
      stockCritico: document.getElementById('fpStockCritico').value
    };

    if (esEdicion) {
      dbActualizarProducto(productoExistente.id, datos);
    } else {
      dbAgregarProducto(datos);
    }

    cerrarFormularioProducto();
    renderizarTablaProductos();
  });
}

function cerrarFormularioProducto() {
  const overlay = document.getElementById('jsOverlayProducto');
  if (overlay) overlay.remove();
}
