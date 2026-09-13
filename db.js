/* ============================================================
   db.js
   Simula una base de datos usando localStorage.
   Aquí se guardan y gestionan los productos (materias primas)
   del Restaurante La Cucina Nostra.

   Este archivo NO dibuja nada en pantalla: solo expone
   funciones que productos.js y home.js pueden usar para
   leer y modificar los datos.
   ============================================================ */

const DB_KEYS = {
  PRODUCTOS: 'lcn_productos',
  USUARIOS: 'lcn_usuarios'
};

/* Datos de ejemplo: son los mismos que ya estaban escritos
   a mano en productos.html. Se usan solo la primera vez que
   se abre el sitio (cuando localStorage todavía está vacío). */
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'Tomate',          categoria: 'Verduras',           unidad: 'kg',        stock: 20, stockCritico: 5  },
  { id: 2, nombre: 'Harina',          categoria: 'Despensa',           unidad: 'kg',        stock: 35, stockCritico: 10 },
  { id: 3, nombre: 'Huevos',          categoria: 'Lácteos y huevos',   unidad: 'unidades',  stock: 48, stockCritico: 12 },
  { id: 4, nombre: 'Sal',             categoria: 'Despensa',           unidad: 'kg',        stock: 8,  stockCritico: 3  },
  { id: 5, nombre: 'Aceite de oliva', categoria: 'Aceites',            unidad: 'litros',    stock: 6,  stockCritico: 2  },
  { id: 6, nombre: 'Albahaca',        categoria: 'Hierbas',            unidad: 'kg',        stock: 3,  stockCritico: 2  },
  { id: 7, nombre: 'Orégano',         categoria: 'Hierbas',            unidad: 'kg',        stock: 4,  stockCritico: 2  },
  { id: 8, nombre: 'Ajo',             categoria: 'Verduras',           unidad: 'kg',        stock: 5,  stockCritico: 2  },
  { id: 9, nombre: 'Charcutería',     categoria: 'Carnes y embutidos', unidad: 'kg',        stock: 2,  stockCritico: 3  }
];

/* Crea los datos iniciales en localStorage solo si todavía
   no existe nada guardado (por ejemplo, la primera visita). */
function dbInicializar() {
  const existe = localStorage.getItem(DB_KEYS.PRODUCTOS);
  if (!existe) {
    localStorage.setItem(DB_KEYS.PRODUCTOS, JSON.stringify(PRODUCTOS_INICIALES));
  }
}

/* Devuelve el arreglo completo de productos. */
function dbObtenerProductos() {
  dbInicializar();
  try {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTOS)) || [];
  } catch (error) {
    console.error('Error al leer productos de localStorage:', error);
    return [];
  }
}

/* Sobrescribe el arreglo completo de productos. */
function dbGuardarProductos(productos) {
  localStorage.setItem(DB_KEYS.PRODUCTOS, JSON.stringify(productos));
}

/* Genera un id nuevo, correlativo al mayor id existente. */
function dbGenerarIdProducto() {
  const productos = dbObtenerProductos();
  if (productos.length === 0) return 1;
  return Math.max(...productos.map((p) => p.id)) + 1;
}

/* Agrega un producto nuevo. 'producto' debe traer:
   { nombre, categoria, unidad, stock, stockCritico } */
function dbAgregarProducto(producto) {
  const productos = dbObtenerProductos();
  const nuevoProducto = {
    id: dbGenerarIdProducto(),
    nombre: producto.nombre,
    categoria: producto.categoria,
    unidad: producto.unidad,
    stock: Number(producto.stock),
    stockCritico: Number(producto.stockCritico)
  };
  productos.push(nuevoProducto);
  dbGuardarProductos(productos);
  return nuevoProducto;
}

/* Actualiza un producto existente por id. 'cambios' puede
   traer solo algunos campos, no es obligatorio enviarlos todos. */
function dbActualizarProducto(id, cambios) {
  const productos = dbObtenerProductos();
  const indice = productos.findIndex((p) => p.id === id);
  if (indice === -1) return null;

  productos[indice] = {
    ...productos[indice],
    ...cambios,
    stock: cambios.stock !== undefined ? Number(cambios.stock) : productos[indice].stock,
    stockCritico: cambios.stockCritico !== undefined ? Number(cambios.stockCritico) : productos[indice].stockCritico
  };

  dbGuardarProductos(productos);
  return productos[indice];
}

/* Elimina un producto por id. */
function dbEliminarProducto(id) {
  const productos = dbObtenerProductos().filter((p) => p.id !== id);
  dbGuardarProductos(productos);
}

/* Busca un producto puntual por id. */
function dbObtenerProductoPorId(id) {
  return dbObtenerProductos().find((p) => p.id === id) || null;
}

/* Calcula el estado visual de un producto según su stock,
   comparado con su stock crítico:
   - stock <= stockCritico        -> "Stock crítico" (rojo)
   - stock <= stockCritico + 1    -> "Stock bajo"     (amarillo)
   - cualquier otro caso          -> "Disponible"     (verde)  */
function dbObtenerEstadoProducto(producto) {
  if (producto.stock <= producto.stockCritico) {
    return { texto: 'Stock crítico', clase: 'bg-danger' };
  }
  if (producto.stock <= producto.stockCritico + 1) {
    return { texto: 'Stock bajo', clase: 'bg-warning text-dark' };
  }
  return { texto: 'Disponible', clase: 'bg-success' };
}

/* Devuelve la lista de categorías únicas ya usadas,
   útil para sugerencias en el formulario. */
function dbObtenerCategorias() {
  const productos = dbObtenerProductos();
  return [...new Set(productos.map((p) => p.categoria))].sort();
}

/* ============================================================
   Usuarios (historial de pedidos realizados por clientes)
   Se muestran en usuarios.html: fecha, código de orden,
   cliente, estado y monto del pedido.
   ============================================================ */

const USUARIOS_INICIALES = [
  { id: 1,  fecha: '2026-09-05', codigoOrden: 'ORD-1038', cliente: 'Sofía Martínez',   estado: 'Entregado',      monto: 15990 },
  { id: 2,  fecha: '2026-09-06', codigoOrden: 'ORD-1039', cliente: 'Diego Fernández',  estado: 'Entregado',      monto: 21990 },
  { id: 3,  fecha: '2026-09-07', codigoOrden: 'ORD-1040', cliente: 'Valentina Castro', estado: 'Cancelado',      monto: 8990  },
  { id: 4,  fecha: '2026-09-08', codigoOrden: 'ORD-1041', cliente: 'Juan Pérez',       estado: 'Entregado',      monto: 18990 },
  { id: 5,  fecha: '2026-09-09', codigoOrden: 'ORD-1042', cliente: 'Camila Torres',    estado: 'En preparación', monto: 27990 },
  { id: 6,  fecha: '2026-09-10', codigoOrden: 'ORD-1043', cliente: 'María González',   estado: 'Pendiente',      monto: 12500 },
  { id: 7,  fecha: '2026-09-11', codigoOrden: 'ORD-1044', cliente: 'Carlos Rojas',     estado: 'En preparación', monto: 23990 },
  { id: 8,  fecha: '2026-09-11', codigoOrden: 'ORD-1045', cliente: 'Ana Silva',        estado: 'Cancelado',      monto: 9990  },
  { id: 9,  fecha: '2026-09-12', codigoOrden: 'ORD-1046', cliente: 'Pedro Muñoz',      estado: 'Entregado',      monto: 15990 },
  { id: 10, fecha: '2026-09-13', codigoOrden: 'ORD-1047', cliente: 'Isidora Vargas',   estado: 'Pendiente',      monto: 19990 }
];

/* Crea los datos iniciales de usuarios/pedidos solo si
   todavía no existe nada guardado en localStorage. */
function dbInicializarUsuarios() {
  const existe = localStorage.getItem(DB_KEYS.USUARIOS);
  if (!existe) {
    localStorage.setItem(DB_KEYS.USUARIOS, JSON.stringify(USUARIOS_INICIALES));
  }
}

/* Devuelve el arreglo completo de usuarios/pedidos. */
function dbObtenerUsuarios() {
  dbInicializarUsuarios();
  try {
    return JSON.parse(localStorage.getItem(DB_KEYS.USUARIOS)) || [];
  } catch (error) {
    console.error('Error al leer usuarios de localStorage:', error);
    return [];
  }
}

/* Sobrescribe el arreglo completo de usuarios/pedidos. */
function dbGuardarUsuarios(usuarios) {
  localStorage.setItem(DB_KEYS.USUARIOS, JSON.stringify(usuarios));
}

/* Genera un id nuevo, correlativo al mayor id existente. */
function dbGenerarIdUsuario() {
  const usuarios = dbObtenerUsuarios();
  if (usuarios.length === 0) return 1;
  return Math.max(...usuarios.map((u) => u.id)) + 1;
}

/* Agrega un registro nuevo. 'usuario' debe traer:
   { fecha, codigoOrden, cliente, estado, monto } */
function dbAgregarUsuario(usuario) {
  const usuarios = dbObtenerUsuarios();
  const nuevoUsuario = {
    id: dbGenerarIdUsuario(),
    fecha: usuario.fecha,
    codigoOrden: usuario.codigoOrden,
    cliente: usuario.cliente,
    estado: usuario.estado,
    monto: Number(usuario.monto)
  };
  usuarios.push(nuevoUsuario);
  dbGuardarUsuarios(usuarios);
  return nuevoUsuario;
}

/* Actualiza un registro existente por id. */
function dbActualizarUsuario(id, cambios) {
  const usuarios = dbObtenerUsuarios();
  const indice = usuarios.findIndex((u) => u.id === id);
  if (indice === -1) return null;

  usuarios[indice] = {
    ...usuarios[indice],
    ...cambios,
    monto: cambios.monto !== undefined ? Number(cambios.monto) : usuarios[indice].monto
  };

  dbGuardarUsuarios(usuarios);
  return usuarios[indice];
}

/* Elimina un registro por id. */
function dbEliminarUsuario(id) {
  const usuarios = dbObtenerUsuarios().filter((u) => u.id !== id);
  dbGuardarUsuarios(usuarios);
}

/* Busca un registro puntual por id. */
function dbObtenerUsuarioPorId(id) {
  return dbObtenerUsuarios().find((u) => u.id === id) || null;
}

/* Calcula la badge de color según el estado del pedido. */
function dbObtenerEstadoUsuario(usuario) {
  switch (usuario.estado) {
    case 'Entregado':
      return { texto: 'Entregado', clase: 'bg-success' };
    case 'Pendiente':
      return { texto: 'Pendiente', clase: 'bg-warning text-dark' };
    case 'En preparación':
      return { texto: 'En preparación', clase: 'bg-info text-dark' };
    case 'Cancelado':
      return { texto: 'Cancelado', clase: 'bg-danger' };
    default:
      return { texto: usuario.estado, clase: 'bg-secondary' };
  }
}

/* Formatea un monto en pesos chilenos, ej: 18990 -> "$18.990". */
function dbFormatearMonto(monto) {
  return '$' + Number(monto).toLocaleString('es-CL');
}
