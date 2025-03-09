// Cuenta regresiva
document.addEventListener('DOMContentLoaded', function () {
    // Configuración de música de fondo
    setupBackgroundMusic();

    // Configuración de la fecha de la boda
    const weddingDate = new Date('May 17, 2025 16:00:00').getTime();

    // Actualizar el contador cada segundo
    const countdown = setInterval(function () {
        const now = new Date().getTime();
        const timeLeft = weddingDate - now;

        // Cálculos de tiempo
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Actualizar elementos HTML
        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');

        // Si la cuenta regresiva ha terminado
        if (timeLeft < 0) {
            clearInterval(countdown);
            document.getElementById('countdown').innerHTML = '<h3>¡El gran día ha llegado!</h3>';
        }
    }, 1000);

    // Configurar el formulario RSVP
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Obtener datos del formulario
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const asistentes = document.getElementById('asistentes').value;

            // Mostrar indicador de carga
            const submitBtn = document.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            // Crear objeto con los datos para enviar a Google Apps Script
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('email', email);
            formData.append('asistentes', asistentes);

            // Enviar datos a Google Apps Script
            fetch('https://script.google.com/macros/s/AKfycbyAsCw8kHeWLRyhJ-fmGL-EefEPZFwgLjzTmGlo5BYd70rndlimWfLuB0qAHW08eaN-Pg/exec', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    // Restablecer el botón
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;

                    // Mostrar confirmación
                    mostrarConfirmacion(nombre, asistentes);

                    // Limpiar el formulario
                    rsvpForm.reset();
                })
                .catch(error => {
                    // Mostrar error
                    console.error('Error:', error);
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    alert('Hubo un error al enviar tu confirmación. Por favor, intenta de nuevo.');
                });
        });
    }
});

// Configuración de música de fondo
function setupBackgroundMusic() {
    // Crear elemento de audio si no existe
    if (!document.getElementById('backgroundMusic')) {
        const audioElement = document.createElement('audio');
        audioElement.id = 'backgroundMusic';
        audioElement.loop = true;
        audioElement.volume = 0.5; // Volumen al 50%
        // Agregar atributos para intentar permitir reproducción automática
        audioElement.autoplay = true;

        // Agregar fuente de audio - Reemplaza 'ruta/a/tu/musica.mp3' con la ruta real a tu archivo de música
        const sourceElement = document.createElement('source');
        sourceElement.src = 'audio/andres-cepeda-por-el-resto-de-mi-vida-letra.mp3';
        sourceElement.type = 'audio/mpeg';
        audioElement.autoplay = true;
        audioElement.muted = true;


        audioElement.appendChild(sourceElement);
        document.body.appendChild(audioElement);

        // Crear el botón de control de música
        createMusicControl();

        // Intentar reproducir automáticamente
        const playPromise = audioElement.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Reproducción automática exitosa (silenciada)
                    console.log('Reproducción automática iniciada (silenciada)');

                    // Intentar activar el sonido después de la interacción del usuario
                    const enableSound = function () {
                        audioElement.muted = false;
                        updateMusicControlIcon(true);

                        // Eliminar los event listeners después de la primera interacción
                        document.removeEventListener('click', enableSound);
                        document.removeEventListener('touchstart', enableSound);
                        document.removeEventListener('keydown', enableSound);
                        document.removeEventListener('scroll', enableSound);
                    };

                    // Detectar interacción del usuario para activar el sonido
                    document.addEventListener('click', enableSound);
                    document.addEventListener('touchstart', enableSound);
                    document.addEventListener('keydown', enableSound);
                    document.addEventListener('scroll', enableSound);
                })
                .catch(error => {
                    console.log('Reproducción automática bloqueada. El usuario deberá hacer clic en el control de música.');
                    // Cambiar el ícono a "play" ya que la música está pausada
                    updateMusicControlIcon(false);

                    // Intentar nuevamente en la primera interacción del usuario
                    const startMusic = function () {
                        audioElement.play()
                            .then(() => {
                                audioElement.muted = false;
                                updateMusicControlIcon(true);
                            })
                            .catch(e => console.error('No se pudo reproducir aún con interacción:', e));

                        // Eliminar los event listeners después de la primera interacción
                        document.removeEventListener('click', startMusic);
                        document.removeEventListener('touchstart', startMusic);
                    };

                    document.addEventListener('click', startMusic);
                    document.addEventListener('touchstart', startMusic);
                });
        }
    }
}

// Crear botón de control de música
function createMusicControl() {
    // Crear el contenedor para el control de música
    const musicControl = document.createElement('div');
    musicControl.id = 'musicControl';
    musicControl.className = 'music-control';
    musicControl.innerHTML = '<i class="fas fa-volume-up"></i>';
    musicControl.title = 'Activar/Desactivar música';

    // Estilos CSS en línea
    musicControl.style.position = 'fixed';
    musicControl.style.bottom = '20px';
    musicControl.style.right = '20px';
    musicControl.style.width = '40px';
    musicControl.style.height = '40px';
    musicControl.style.borderRadius = '50%';
    musicControl.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    musicControl.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    musicControl.style.display = 'flex';
    musicControl.style.justifyContent = 'center';
    musicControl.style.alignItems = 'center';
    musicControl.style.cursor = 'pointer';
    musicControl.style.zIndex = '1000';
    musicControl.style.transition = 'all 0.3s ease';

    // Agregar evento de clic para controlar la música
    musicControl.addEventListener('click', toggleMusic);

    // Agregar al body
    document.body.appendChild(musicControl);
}

// Alternar música (reproducir/pausar)
function toggleMusic() {
    const audio = document.getElementById('backgroundMusic');
    const isPlaying = !audio.paused;

    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(error => {
            console.error('Error al reproducir música:', error);
        });
    }

    // Actualizar el ícono
    updateMusicControlIcon(!isPlaying);
}

// Actualizar ícono del control de música
function updateMusicControlIcon(isPlaying) {
    const musicControl = document.getElementById('musicControl');
    if (musicControl) {
        musicControl.innerHTML = isPlaying ?
            '<i class="fas fa-volume-up"></i>' :
            '<i class="fas fa-volume-mute"></i>';
    }
}

// Función para mostrar el popup de confirmación
function mostrarConfirmacion(nombre, asistentes) {
    // Configurar el mensaje de confirmación
    document.getElementById('confirmationDetails').textContent =
        `Hemos registrado tu confirmación, ${nombre}, para ${asistentes} ${asistentes > 1 ? 'personas' : 'persona'}.`;

    // Mostrar el overlay
    const overlay = document.getElementById('confirmationOverlay');
    overlay.style.display = 'flex';

    // Agregar la clase active para la animación
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
}

// Función para cerrar el popup
function cerrarPopup() {
    const overlay = document.getElementById('confirmationOverlay');
    overlay.classList.remove('active');

    // Esperar a que termine la animación
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// Navegación suave para los enlaces del menú
document.querySelectorAll('.nav-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 60,
                behavior: 'smooth'
            });
        }
    });
});
