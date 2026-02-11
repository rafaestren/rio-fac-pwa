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
    
    // Llenar datos
    document.getElementById('comercio').textContent = data.datos_extraidos.comercio;
    document.getElementById('fecha').textContent = data.datos_extraidos.fecha;
    document.getElementById('total').textContent = `$${data.datos_extraidos.total}`;
    document.getElementById('motor').textContent = data.motor_usado;
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
