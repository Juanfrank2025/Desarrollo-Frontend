/* ============================================
   RUTA DE PAZ - ALOJAMIENTO TURÍSTICO v4
   JavaScript: Manipulación del DOM, Validación,
   Envío real de correos vía Formspree,
   Limpieza automática del formulario y
   Modal de confirmación personalizado
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ELEMENTOS DEL DOM
    const navbar = document.querySelector('#navbar');
    const navToggle = document.querySelector('#navToggle');
    const navMenu = document.querySelector('#navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const reservaForm = document.querySelector('#reservaForm');
    const btnSubmit = document.querySelector('#btnSubmit');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const successOverlay = document.querySelector('#successOverlay');
    const successEmail = document.querySelector('#successEmail');
    const btnNewReservation = document.querySelector('#btnNewReservation');
    const btnReset = document.querySelector('#btnReset');
    
    // 1. NAVBAR SCROLL EFFECT
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveLink();
    }
    window.addEventListener('scroll', handleScroll);
    
    // 2. MENÚ HAMBURGUESA
    function toggleMenu() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    navToggle.addEventListener('click', toggleMenu);
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) toggleMenu();
        });
    });
    document.addEventListener('click', function(event) {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(event.target) && 
            !navToggle.contains(event.target)) {
            toggleMenu();
        }
    });
    
    // 3. LINK ACTIVO EN NAVBAR
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // 4. VALIDACIÓN DEL FORMULARIO
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4}[-\s\.]?[0-9]{4}$/;
    const today = new Date().toISOString().split('T')[0];
    
    const fechaLlegadaInput = document.querySelector('#fecha-llegada');
    const fechaSalidaInput = document.querySelector('#fecha-salida');
    
    // Función para establecer fechas mínimas
    function setMinDates() {
        if (fechaLlegadaInput) fechaLlegadaInput.setAttribute('min', today);
        if (fechaSalidaInput) fechaSalidaInput.setAttribute('min', today);
    }
    setMinDates();
    
    function showError(fieldId, message) {
        const field = document.querySelector('#' + fieldId);
        const errorElement = document.querySelector('#error-' + fieldId);
        if (field && errorElement) {
            field.classList.add('error');
            errorElement.textContent = message;
        }
    }
    
    function clearError(fieldId) {
        const field = document.querySelector('#' + fieldId);
        const errorElement = document.querySelector('#error-' + fieldId);
        if (field && errorElement) {
            field.classList.remove('error');
            errorElement.textContent = '';
        }
    }
    
    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(function(el) {
            el.textContent = '';
        });
        document.querySelectorAll('input.error, select.error, textarea.error').forEach(function(input) {
            input.classList.remove('error');
        });
    }
    
    const formFields = ['nombre', 'email', 'telefono', 'tipo-alojamiento', 'fecha-llegada', 'fecha-salida', 'personas'];
    
    formFields.forEach(function(fieldId) {
        const field = document.querySelector('#' + fieldId);
        if (field) {
            field.addEventListener('input', function() { clearError(fieldId); });
            field.addEventListener('blur', function() { validateField(fieldId); });
        }
    });
    
    function validateField(fieldId) {
        const field = document.querySelector('#' + fieldId);
        const value = field.value.trim();
        clearError(fieldId);
        
        switch(fieldId) {
            case 'nombre':
                if (value === '') { showError(fieldId, 'El nombre completo es obligatorio'); return false; }
                else if (value.length < 3) { showError(fieldId, 'El nombre debe tener al menos 3 caracteres'); return false; }
                else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) { showError(fieldId, 'El nombre solo puede contener letras y espacios'); return false; }
                break;
            case 'email':
                if (value === '') { showError(fieldId, 'El correo electrónico es obligatorio'); return false; }
                else if (!emailRegex.test(value)) { showError(fieldId, 'Ingresa un correo válido (ej: usuario@email.com)'); return false; }
                break;
            case 'telefono':
                if (value === '') { showError(fieldId, 'El teléfono es obligatorio'); return false; }
                else if (!telefonoRegex.test(value)) { showError(fieldId, 'Número válido: +503 7777-8888 o 77778888'); return false; }
                break;
            case 'tipo-alojamiento':
                if (value === '') { showError(fieldId, 'Selecciona un tipo de alojamiento'); return false; }
                break;
            case 'fecha-llegada':
                if (value === '') { showError(fieldId, 'La fecha de llegada es obligatoria'); return false; }
                else if (value < today) { showError(fieldId, 'La fecha no puede ser anterior a hoy'); return false; }
                break;
            case 'fecha-salida':
                const fechaLlegada = document.querySelector('#fecha-llegada').value;
                if (value === '') { showError(fieldId, 'La fecha de salida es obligatoria'); return false; }
                else if (fechaLlegada && value < fechaLlegada) { showError(fieldId, 'Debe ser posterior o igual a la llegada'); return false; }
                break;
            case 'personas':
                if (value === '') { showError(fieldId, 'El número de personas es obligatorio'); return false; }
                else if (isNaN(value) || parseInt(value) < 1) { showError(fieldId, 'Debe haber al menos 1 persona'); return false; }
                else if (parseInt(value) > 20) { showError(fieldId, 'Máximo 20 personas por reservación'); return false; }
                break;
        }
        return true;
    }
    
    function validateForm() {
        let isValid = true;
        formFields.forEach(function(fieldId) {
            if (!validateField(fieldId)) isValid = false;
        });
        return isValid;
    }
    
    // 5. FUNCIÓN PARA LIMPIAR FORMULARIO COMPLETAMENTE
    function resetFormularioCompleto() {
        reservaForm.reset();           // Limpia todos los campos HTML
        clearAllErrors();              // Limpia mensajes de error visuales
        setMinDates();                 // Restaura fechas mínimas
        
        // Asegurar que el overlay de éxito esté oculto
        if (successOverlay) successOverlay.style.display = 'none';
        
        // Restaurar botón de envío
        btnSubmit.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
    
    // 6. ENVÍO DEL FORMULARIO VÍA FORMSPREE
    reservaForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Ocultar modal de éxito previo
        if (successOverlay) successOverlay.style.display = 'none';
        
        // Validar todo antes de enviar
        if (!validateForm()) {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        const formData = new FormData(reservaForm);
        const emailValue = document.querySelector('#email').value;
        
        // Mostrar estado de carga
        btnSubmit.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        
        fetch(reservaForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function(response) {
            if (response.ok) {
                // ÉXITO: LIMPIEZA AUTOMÁTICA COMPLETA DEL FORMULARIO
                reservaForm.reset();           // Limpia todos los inputs
                clearAllErrors();              // Limpia errores visuales
                setMinDates();                 // Restaura fechas mínimas
                
                // Mostrar modal de éxito personalizado
                if (successOverlay) {
                    successOverlay.style.display = 'flex';
                    successEmail.textContent = emailValue;
                }
                
                // Scroll al mensaje de éxito
                if (successOverlay) {
                    successOverlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                throw new Error('Error en el servidor');
            }
        })
        .catch(function(error) {
            console.log('Fetch falló, intentando envío tradicional...', error);
            reservaForm.submit();
        })
        .finally(function() {
            btnSubmit.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        });
    });
    
    // 7. BOTÓN "HACER OTRA RESERVACIÓN" - Formulario limpio y listo
    if (btnNewReservation) {
        btnNewReservation.addEventListener('click', function() {
            resetFormularioCompleto();     // Limpieza total
            reservaForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    
    // 8. BOTÓN RESET - Limpiar formulario manualmente
    if (btnReset) {
        btnReset.addEventListener('click', function() {
            resetFormularioCompleto();     // Limpieza total
        });
    }
    
    // 9. ACTUALIZAR FECHA MÍNIMA DE SALIDA
    if (fechaLlegadaInput && fechaSalidaInput) {
        fechaLlegadaInput.addEventListener('change', function() {
            fechaSalidaInput.setAttribute('min', this.value);
            if (fechaSalidaInput.value && fechaSalidaInput.value < this.value) {
                fechaSalidaInput.value = '';
                clearError('fecha-salida');
            }
        });
    }
    
    // 10. ANIMACIONES AL SCROLL (IntersectionObserver)
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.servicio-card').forEach(function(card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
        observer.observe(card);
    });
    
    document.querySelectorAll('.sitio-card').forEach(function(card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease ' + (index * 0.15) + 's, transform 0.6s ease ' + (index * 0.15) + 's';
        observer.observe(card);
    });
    
    // CONSOLA LIMPIA
    console.log('✅ Ruta de Paz v4 cargado correctamente');
    console.log('📋 Funcionalidades activas:');
    console.log('   • Navbar scroll effect');
    console.log('   • Menú hamburguesa responsive');
    console.log('   • Validación de formulario en tiempo real');
    console.log('   • Envío de correos vía Formspree');
    console.log('   • Limpieza automática del formulario al enviar');
    console.log('   • Modal de confirmación personalizado con animación SVG');
    console.log('   • Formulario listo para nueva reservación');
    // Formspree: envío de correos con autoresponse activado para juanfrank
});