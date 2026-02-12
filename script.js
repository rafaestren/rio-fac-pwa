// URL de tu API en Render (SIN barra al final)
const API_URL = 'https://rio-fac.onrender.com';

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

// Event listener para el input de archivo
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
        alert('⚠️ Por favor selecciona una imagen');
        return;
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        alert('⚠️ Solo puedes subir imágenes');
        return;
    }

    // Mostrar indicador de carga
    uploadSection.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        // Crear FormData
        const formData = new FormData();
        formData.append('file', file);

        console.log('📤 Enviando imagen al servidor...');

        // Hacer request al backend
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        console.log('📥 Respuesta recibida:', response.status);

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Datos recibidos:', data);

        // Verificar si hubo error en el OCR
        if (data.error) {
            throw new Error(data.error);
        }

        // Mostrar resultados
        mostrarResultados(data);

    } catch (error) {
        console.error('❌ Error:', error);
        alert(`❌ Error al procesar la imagen: ${error.message}`);
        resetApp();
    }
});

// Función para mostrar resultados
function mostrarResultados(data) {
    // Ocultar loading
    loading.classList.add('hidden');
    
    // Mostrar resultados
    result.classList.remove('hidden');
    
    // Llenar datos principales
    document.getElementById('comercio').textContent = data.datos_extraidos.comercio;
    document.getElementById('fecha').textContent = data.datos_extraidos.fecha;
    
    // Formatear el total con separadores de miles
    const totalFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(data.datos_extraidos.total);
    document.getElementById('total').textContent = totalFormateado;
    
    document.getElementById('motor').textContent = data.motor_usado;
    
    // Mostrar número de productos
    const numProductos = data.datos_extraidos.num_productos || 0;
    document.getElementById('numProductos').textContent = numProductos;
    
    // Mostrar lista de productos si hay
    const productosContainer = document.getElementById('productosContainer');
    const listaProductos = document.getElementById('listaProductos');
    
    if (numProductos > 0 && data.datos_extraidos.productos) {
        productosContainer.classList.remove('hidden');
        listaProductos.innerHTML = '';
        
        data.datos_extraidos.productos.forEach((producto, index) => {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto-item';
            productoDiv.innerHTML = `
                <span class="producto-nombre">${producto.nombre}</span>
                <span class="producto-cantidad">x${producto.cantidad}</span>
                <span class="producto-precio">${new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(producto.precio)}</span>
            `;
            listaProductos.appendChild(productoDiv);
        });
    } else {
        productosContainer.classList.add('hidden');
    }
}

// Función para resetear la app
function resetApp() {
    result.classList.add('hidden');
    loading.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    fileInput.value = ''; // Limpiar el input
}

// Verificar conexión con el backend al cargar
window.addEventListener('load', async () => {
    console.log('🚀 Aplicación cargada');
    console.log('🔗 Backend URL:', API_URL);
    
    try {
        const response = await fetch(`${API_URL}/`);
        const data = await response.json();
        console.log('✅ Backend conectado:', data);
    } catch (error) {
        console.error('⚠️ No se pudo conectar con el backend:', error);
        console.error('Verifica que el backend esté activo en:', API_URL);
    }
});
