// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    // Inicializar modo oscuro/claro
    initTheme();

    // Cargar datos guardados del localStorage
    loadSavedData();
    setupHourTypeSettings();

    // Por defecto, la tabla (y por tanto las tarjetas) muestran el mes actual
    const { from, to } = getCurrentMonthRange();
    overtimeFilterDateFrom = from;
    overtimeFilterDateTo = to;
    document.getElementById('overtime-date-from').value = from;
    document.getElementById('overtime-date-to').value = to;

    // Cargar datos iniciales
    loadDashboardData();
    loadEmployeesTable();
    loadOvertimeTable();
    loadKanbanBoard();
    loadCharts();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar eventos de modales
    setupModals();
    
    // Configurar eventos de formularios
    setupForms();
    
    // Configurar eventos de Kanban
    setupKanban();
    
    // Configurar eventos de búsqueda
    setupSearch();

    // Configurar filtros y selección múltiple de horas extras
    setupOvertimeFilters();

    // Configurar botones de exportación
    setupExportButtons();

    // Configurar selector de periodo de los gráficos de Reportes
    setupReportPeriodFilter();

    document.getElementById('backup-reminder-download').addEventListener('click', exportBackup);
    document.getElementById('backup-reminder-snooze').addEventListener('click', snoozeBackupReminder);
    updateBackupReminder();
}

// Inicializar tema (claro/oscuro)
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    // Verificar preferencia guardada o del sistema
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeText.textContent = 'Modo Claro';
    }
    
    // Alternar tema al hacer clic
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeText.textContent = 'Modo Claro';
        } else {
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeText.textContent = 'Modo Oscuro';
        }
        
        // Recargar gráficos con nuevos colores
        loadCharts();
    });
}

// Configurar navegación entre secciones
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Actualizar botón activo
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(sectionId).classList.add('active');
            
            // Recargar datos específicos de la sección
            if (sectionId === 'dashboard') {
                loadDashboardData();
            } else if (sectionId === 'empleados') {
                loadEmployeesTable();
            } else if (sectionId === 'kanban') {
                loadKanbanBoard();
            } else if (sectionId === 'reportes') {
                loadCharts();
            }
        });
    });
}

// Configurar eventos de formularios
function setupForms() {
    // Formulario de horas extras
    document.getElementById('overtime-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveOvertime();
    });
    
    // Formulario de empleado
    document.getElementById('employee-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEmployee();
    });
}
