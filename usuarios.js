/* ============================================================
   usuarios.js
   Dibuja la tabla de pedidos de clientes en usuarios.html
   usando los datos guardados por db.js (localStorage).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderizarTablaUsuarios();

  const tbody = document.getElementById('jsTablaUsuarios');
  if (tbody) {
    tbody.addEventListener('click', (evento) => {
      const btnEliminar = evento.target.closest('[data-accion="eliminar"]');
      if (!btnEliminar) return;

      const id = Number(btnEliminar.dataset.id);
      const usuario = dbObtenerUsuarioPorId(id);
      const codigo = usuario ? usuario.codigoOrden : 'este pedido';

      if (confirm(`¿Eliminar el pedido ${codigo} del historial?`)) {
        dbEliminarUsuario(id);
        renderizarTablaUsuarios();
      }
    });
  }
});

/* Lee los pedidos desde db.js y reconstruye el <tbody>. */
function renderizarTablaUsuarios() {
  const tbody = document.getElementById('jsTablaUsuarios');
  const mensajeSinUsuarios = document.getElementById('jsSinUsuarios');
  if (!tbody) return;

  const usuarios = dbObtenerUsuarios();
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    if (mensajeSinUsuarios) mensajeSinUsuarios.style.display = 'block';
    return;
  }

  if (mensajeSinUsuarios) mensajeSinUsuarios.style.display = 'none';

  // Los más recientes primero
  const usuariosOrdenados = [...usuarios].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  usuariosOrdenados.forEach((usuario) => {
    const estado = dbObtenerEstadoUsuario(usuario);

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatearFecha(usuario.fecha)}</td>
      <td>${escaparHtmlUsuarios(usuario.codigoOrden)}</td>
      <td>${escaparHtmlUsuarios(usuario.cliente)}</td>
      <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
      <td>${dbFormatearMonto(usuario.monto)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" type="button" title="Eliminar" data-accion="eliminar" data-id="${usuario.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

/* Convierte "2026-09-11" en "11-09-2026" para que se lea
   más natural en la tabla. */
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}-${mes}-${anio}`;
}

function escaparHtmlUsuarios(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}
