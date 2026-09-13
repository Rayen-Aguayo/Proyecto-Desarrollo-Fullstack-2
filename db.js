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
  PRODUCTOS: 'lcn_productos'
  // 'lcn_usuarios' queda reservado para usuarios.html más adelante
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
