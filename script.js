// Variable para rastrear la posición de cada carrusel
const carouselPositions = {
    'carousel-video': 0,
    'carousel-animacion': 0,
    'carousel-modelado': 0
};

/**
 * Mueve un carrusel a la izquierda o derecha.
 * @param {string} carouselId - El ID del contenedor del carrusel.
 * @param {number} direction - -1 para izquierda, 1 para derecha.
 */
function moveCarousel(carouselId, direction) {
    const container = document.getElementById(carouselId);
    const inner = container.querySelector('.carousel-inner');
    const items = inner.querySelectorAll('.carousel-item');
    
    // Determinar cuántos ítems mostrar (3 en desktop, 1 en móvil)
    const itemsToShow = window.innerWidth <= 768 ? 1 : 3; 
    const totalItems = items.length;
    
    let currentPosition = carouselPositions[carouselId];

    currentPosition += direction;

    // Lógica de scroll cíclico
    if (direction === 1) { // Siguiente (Derecha)
        if (currentPosition > totalItems - itemsToShow) {
            currentPosition = 0; // Vuelve al inicio
        }
    } else { // Anterior (Izquierda)
        if (currentPosition < 0) {
            // Ir al último grupo visible
            currentPosition = totalItems - itemsToShow; 
        }
    }

    // Asegurar que la posición no sea negativa si hay menos items que los visibles (caso raro)
    currentPosition = Math.max(0, currentPosition);

    carouselPositions[carouselId] = currentPosition;
    
    // Cálculo del desplazamiento en píxeles
    const itemWidth = items[0].offsetWidth;
    const translateX = currentPosition * itemWidth;

    // Aplicar el desplazamiento
    inner.style.transform = `translateX(-${translateX}px)`;
}


// FUNCIÓN: Extraer el ID de YouTube
function getYouTubeID(url) {
    // Regex para manejar 'youtube.com/watch?v=' y 'youtu.be/'
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|\w+\/|watch\?v=))([^&]+)|(?:youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    if (match) {
        // match[1] para URL larga, match[2] para URL corta
        return match[1] || match[2];
    }
    return null;
}


/**
 * Script principal: Inicialización y lógica de Scroll Spy / Modal
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------
    // INICIALIZACIÓN CRÍTICA DEL CARRUSEL
    // ----------------------------------------------------------------
    function initializeCarousels() {
        const carouselIds = ['carousel-video', 'carousel-animacion', 'carousel-modelado'];
        carouselIds.forEach(id => {
            const inner = document.getElementById(id)?.querySelector('.carousel-inner');
            if (inner) {
                 // Forzar la posición inicial a 0px
                inner.style.transform = 'translateX(0px)';
                carouselPositions[id] = 0; // Resetear la posición en caso de redimensionamiento
            }
        });
    }
    initializeCarousels();
    window.addEventListener('resize', initializeCarousels); // Re-inicializar al redimensionar
    // ----------------------------------------------------------------

    
    /* ================================== */
    /* LÓGICA DE SCROLL SPY (Barra Lateral) */
    /* ================================== */
    const navIcons = document.querySelectorAll('.nav-sidebar a');
    const sections = document.querySelectorAll('section, header#inicio');

    const options = {
        root: null, 
        threshold: 0.3 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remover clase 'active' de todos los íconos
                navIcons.forEach(icon => icon.classList.remove('active'));
                
                // Agregar clase 'active' al ícono correspondiente
                const targetId = entry.target.id;
                const activeIcon = document.querySelector(`.nav-sidebar a[href="#${targetId}"]`);
                if (activeIcon) {
                    activeIcon.classList.add('active');
                }
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Inicializar el estilo del primer ícono al cargar
    const inicioIcon = document.querySelector('.nav-sidebar a[href="#inicio"]');
    if (inicioIcon) inicioIcon.classList.add('active');


    /* ================================== */
    /* LÓGICA DEL MODAL DE PORTAFOLIO */
    /* ================================== */
    const modal = document.getElementById("portfolioModal");
    const closeButton = document.querySelector(".close-button");
    const modalContent = modal.querySelector(".modal-content");

    // Función para abrir el modal y cargar contenido (imagen o video)
    function openModal(type, src) {
        modalContent.innerHTML = ''; // Limpiar contenido previo

        if (type === 'youtube') {
            const videoId = getYouTubeID(src);
            if (videoId) {
                // 1. Contenedor para mantener la proporción 16:9 (Usamos CSS .video-wrapper)
                const wrapper = document.createElement('div');
                wrapper.className = 'video-wrapper'; 

                // 2. Crea el iframe para el reproductor de YouTube
                const iframe = document.createElement('iframe');
                // Parámetros: autoplay=1, loop=1&playlist=ID, modestbranding=1, rel=0
                iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0`);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay; encrypted-media');
                iframe.setAttribute('allowfullscreen', '');
                
                // Estilos CSS/JS para el iframe
                iframe.style.width = '100%';
                iframe.style.height = '100%';

                wrapper.appendChild(iframe);
                modalContent.appendChild(wrapper);
            }
        } else if (type === 'drive') { // *** NUEVA LÓGICA PARA GOOGLE DRIVE ***
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper'; // Reutilizar el estilo 16:9

            const iframe = document.createElement('iframe');
            // Usar la URL de preview directamente
            iframe.setAttribute('src', src); 
            iframe.setAttribute('frameborder', '0');
            // Se añaden los permisos (autoplay y fullscreen)
            iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen'); 
            iframe.setAttribute('allowfullscreen', '');
            
            iframe.style.width = '100%';
            iframe.style.height = '100%';

            wrapper.appendChild(iframe);
            modalContent.appendChild(wrapper);

        } else if (type === 'image' || type === 'gif') {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Proyecto de Portafolio';
            modalContent.appendChild(img);
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.loop = true;
            
            // Estilo para que el video tenga un tamaño máximo y se vea centrado (HTML5)
            video.style.maxWidth = '1000px'; 
            video.style.maxHeight = '90vh';
            
            modalContent.appendChild(video);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
    }

    // Función para cerrar el modal
    function closeModal() {
        modal.classList.remove('active');
        // Detener la reproducción de cualquier video o iframe
        modalContent.innerHTML = ''; 
        document.body.style.overflow = 'auto'; // Habilitar scroll de fondo
    }

    // Event listeners para cerrar el modal
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Asignar la función openModal a cada elemento del carrusel
    document.querySelectorAll('.carousel-item a').forEach(itemLink => {
        itemLink.addEventListener('click', function(event) {
            event.preventDefault(); // Evita que siga el enlace por defecto

            const url = this.href;
            let type = 'image'; // Por defecto es imagen
            
            // 1. Detección de YouTube
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                type = 'youtube';
            // 2. Detección de Google Drive (Formato /preview)
            } else if (url.includes('drive.google.com/file/d/') && url.includes('/preview')) {
                type = 'drive';
            // 3. Detección de otros tipos de archivo (.mp4, .mov, etc. o descarga directa de Drive)
            } else {
                const extension = url.split('.').pop().toLowerCase();
                if (['mp4', 'webm', 'ogg', 'mov', 'download'].includes(extension)) { 
                    // Se incluye 'download' por si aún usas la URL antigua de descarga
                    type = 'video';
                } else if (extension === 'gif' || extension === 'webp') { 
                    type = 'gif';
                }
            }

            openModal(type, url);
        });
    });
});