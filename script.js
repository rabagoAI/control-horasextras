// Datos iniciales de la aplicación
let employees = [
    { 
        id: 1, 
        name: "Carlos Rodríguez", 
        department: "Ventas", 
        email: "carlos@empresa.com", 
        phone: "(555) 123-4567", 
        position: "Ejecutivo de Ventas", 
        hourlyRate: 50.00,
        overtime: 12.5, 
        overtimeAmount: 625.00,
        lastOvertime: "2023-10-15" 
    },
    { 
        id: 2, 
        name: "Ana García", 
        department: "Marketing", 
        email: "ana@empresa.com", 
        phone: "(555) 234-5678", 
        position: "Especialista en Marketing", 
        hourlyRate: 45.00,
        overtime: 8.0, 
        overtimeAmount: 360.00,
        lastOvertime: "2023-10-18" 
    },
    { 
        id: 3, 
        name: "Luis Martínez", 
        department: "TI", 
        email: "luis@empresa.com", 
        phone: "(555) 345-6789", 
        position: "Desarrollador Senior", 
        hourlyRate: 60.00,
        overtime: 20.5, 
        overtimeAmount: 1230.00,
        lastOvertime: "2023-10-20" 
    },
    { 
        id: 4, 
        name: "María López", 
        department: "RRHH", 
        email: "maria@empresa.com", 
        phone: "(555) 456-7890", 
        position: "Gerente de RRHH", 
        hourlyRate: 55.00,
        overtime: 5.0, 
        overtimeAmount: 275.00,
        lastOvertime: "2023-10-12" 
    },
    { 
        id: 5, 
        name: "Jorge Pérez", 
        department: "Finanzas", 
        email: "jorge@empresa.com", 
        phone: "(555) 567-8901", 
        position: "Contador", 
        hourlyRate: 52.50,
        overtime: 15.0, 
        overtimeAmount: 787.50,
        lastOvertime: "2023-10-19" 
    },
    { 
        id: 6, 
        name: "Sofía Ramírez", 
        department: "Operaciones", 
        email: "sofia@empresa.com", 
        phone: "(555) 678-9012", 
        position: "Coordinadora de Operaciones", 
        hourlyRate: 48.00,
        overtime: 10.5, 
        overtimeAmount: 504.00,
        lastOvertime: "2023-10-16" 
    }
];

let overtimeRecords = [
    { 
        id: 1, 
        employeeId: 1, 
        employeeName: "Carlos Rodríguez", 
        date: "2023-10-15", 
        hours: 3.5, 
        rate: 50.00,
        amount: 175.00,
        reason: "Cierre de trimestre", 
        status: "aprobada" 
    },
    { 
        id: 2, 
        employeeId: 3, 
        employeeName: "Luis Martínez", 
        date: "2023-10-20", 
        hours: 5.0, 
        rate: 60.00,
        amount: 300.00,
        reason: "Mantenimiento de servidores", 
        status: "pendiente" 
    },
    { 
        id: 3, 
        employeeId: 5, 
        employeeName: "Jorge Pérez", 
        date: "2023-10-19", 
        hours: 4.0, 
        rate: 52.50,
        amount: 210.00,
        reason: "Auditoría externa", 
        status: "aprobada" 
    },
    { 
        id: 4, 
        employeeId: 2, 
        employeeName: "Ana García", 
        date: "2023-10-18", 
        hours: 2.5, 
        rate: 45.00,
        amount: 112.50,
        reason: "Lanzamiento de campaña", 
        status: "pendiente" 
    },
    { 
        id: 5, 
        employeeId: 6, 
        employeeName: "Sofía Ramírez", 
        date: "2023-10-16", 
        hours: 3.0, 
        rate: 48.00,
        amount: 144.00,
        reason: "Optimización de procesos", 
        status: "rechazada" 
    },
    { 
        id: 6, 
        employeeId: 4, 
        employeeName: "María López", 
        date: "2023-10-12", 
        hours: 2.0, 
        rate: 55.00,
        amount: 110.00,
        reason: "Entrevistas de selección", 
        status: "aprobada" 
    },
    { 
        id: 7, 
        employeeId: 3, 
        employeeName: "Luis Martínez", 
        date: "2023-10-10", 
        hours: 6.0, 
        rate: 60.00,
        amount: 360.00,
        reason: "Migración de base de datos", 
        status: "aprobada" 
    },
    { 
        id: 8, 
        employeeId: 1, 
        employeeName: "Carlos Rodríguez", 
        date: "2023-10-05", 
        hours: 4.0, 
        rate: 50.00,
        amount: 200.00,
        reason: "Preparación de presentación", 
        status: "aprobada" 
    }
];

let kanbanTasks = [
    { id: 1, title: "Revisar horas extras de octubre", description: "Verificar y aprobar las horas extras registradas en octubre", assignee: "Carlos Rodríguez", priority: "alta", status: "pendiente" },
    { id: 2, title: "Actualizar política de horas extras", description: "Revisar y actualizar la política de compensación por horas extras", assignee: "María López", priority: "media", status: "en-proceso" },
    { id: 3, title: "Preparar informe mensual", description: "Generar informe de horas extras para el departamento de finanzas", assignee: "Jorge Pérez", priority: "alta", status: "aprobada" },
    { id: 4, title: "Capacitación nuevo software", description: "Capacitar al equipo en el nuevo sistema de registro de horas", assignee: "Luis Martínez", priority: "baja", status: "pendiente" },
    { id: 5, title: "Auditar registros Q3", description: "Realizar auditoría de los registros de horas extras del tercer trimestre", assignee: "Sofía Ramírez", priority: "media", status: "en-proceso" },
    { id: 6, title: "Solicitud de compensación", description: "Procesar solicitud de compensación por horas extras acumuladas", assignee: "Ana García", priority: "alta", status: "rechazada" }
];

// Variables globales
let currentOvertimeId = overtimeRecords.length + 1;
let currentEmployeeId = employees.length + 1;
let currentKanbanId = kanbanTasks.length + 1;
let draggedTask = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    // Inicializar modo oscuro/claro
    initTheme();
    
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
    
    // Configurar botones de exportación
    setupExportButtons();
}

// Inicializar tema (claro/oscuro)
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    // Verificar preferencia guardada o del sistema
    const savedTheme = localStorage.getItem('theme') || 'light';
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

// Cargar datos del dashboard
function loadDashboardData() {
    // Calcular estadísticas
    const totalEmployees = employees.length;
    const totalOvertime = overtimeRecords
        .filter(record => record.status === 'aprobada')
        .reduce((sum, record) => sum + record.hours, 0);
    const pendingApprovals = overtimeRecords.filter(record => record.status === 'pendiente').length;
    const totalPay = overtimeRecords
        .filter(record => record.status === 'aprobada')
        .reduce((sum, record) => sum + record.amount, 0);
    
    // Actualizar valores en el DOM
    document.getElementById('total-employees').textContent = totalEmployees;
    document.getElementById('total-overtime').textContent = totalOvertime.toFixed(1);
    document.getElementById('pending-approvals').textContent = pendingApprovals;
    document.getElementById('total-pay').textContent = totalPay.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Cargar tabla de horas extras recientes
    loadOvertimeTable();
}

// Cargar tabla de horas extras
function loadOvertimeTable() {
    const tableBody = document.getElementById('overtime-table');
    tableBody.innerHTML = '';
    
    // Ordenar por fecha (más reciente primero)
    const sortedRecords = [...overtimeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Mostrar solo los últimos 8 registros
    const recentRecords = sortedRecords.slice(0, 8);
    
    recentRecords.forEach(record => {
        const row = document.createElement('tr');
        
        // Formatear fecha
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        // Determinar clase de estado
        let statusClass = '';
        let statusText = '';
        
        switch(record.status) {
            case 'pendiente':
                statusClass = 'status-pendiente';
                statusText = 'Pendiente';
                break;
            case 'aprobada':
                statusClass = 'status-aprobada';
                statusText = 'Aprobada';
                break;
            case 'rechazada':
                statusClass = 'status-rechazada';
                statusText = 'Rechazada';
                break;
        }
        
        row.innerHTML = `
            <td>${record.employeeName}</td>
            <td>${formattedDate}</td>
            <td>${record.hours}</td>
            <td>€${record.rate.toFixed(2)}</td>
            <td>€${record.amount.toFixed(2)}</td>
            <td>${record.reason}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editOvertime(${record.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteOvertime(${record.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Cargar tabla de empleados
function loadEmployeesTable() {
    const tableBody = document.getElementById('employees-table');
    tableBody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        
        // Formatear última fecha de horas extras
        let lastOvertimeFormatted = 'N/A';
        if (employee.lastOvertime) {
            const dateObj = new Date(employee.lastOvertime);
            lastOvertimeFormatted = dateObj.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }
        
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.department}</td>
            <td>${employee.overtime}</td>
            <td>€${employee.overtimeAmount.toFixed(2)}</td>
            <td>${lastOvertimeFormatted}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewEmployee(${employee.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${employee.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Cargar panel Kanban
function loadKanbanBoard() {
    // Limpiar columnas
    const columns = ['pending', 'inprogress', 'approved', 'rejected'];
    columns.forEach(col => {
        document.getElementById(`${col}-column`).innerHTML = '';
    });
    
    // Contadores
    const pendingCount = kanbanTasks.filter(task => task.status === 'pendiente').length;
    const inProgressCount = kanbanTasks.filter(task => task.status === 'en-proceso').length;
    const approvedCount = kanbanTasks.filter(task => task.status === 'aprobada').length;
    const rejectedCount = kanbanTasks.filter(task => task.status === 'rechazada').length;
    
    // Actualizar contadores
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('inprogress-count').textContent = inProgressCount;
    document.getElementById('approved-count').textContent = approvedCount;
    document.getElementById('rejected-count').textContent = rejectedCount;
    
    // Añadir tareas a las columnas correspondientes
    kanbanTasks.forEach(task => {
        const card = createKanbanCard(task);
        
        let columnId;
        switch(task.status) {
            case 'pendiente':
                columnId = 'pending-column';
                break;
            case 'en-proceso':
                columnId = 'inprogress-column';
                break;
            case 'aprobada':
                columnId = 'approved-column';
                break;
            case 'rechazada':
                columnId = 'rejected-column';
                break;
        }
        
        document.getElementById(columnId).appendChild(card);
    });
}

// Crear tarjeta Kanban
function createKanbanCard(task) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.id = task.id;
    
    // Determinar clase de prioridad
    let priorityClass = '';
    let priorityText = '';
    
    switch(task.priority) {
        case 'baja':
            priorityClass = 'priority-baja';
            priorityText = 'Baja';
            break;
        case 'media':
            priorityClass = 'priority-media';
            priorityText = 'Media';
            break;
        case 'alta':
            priorityClass = 'priority-alta';
            priorityText = 'Alta';
            break;
    }
    
    card.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <div class="kanban-card-footer">
            <span>${task.assignee || 'Sin asignar'}</span>
            <span class="kanban-priority ${priorityClass}">${priorityText}</span>
        </div>
    `;
    
    // Eventos de arrastrar y soltar
    card.addEventListener('dragstart', function(e) {
        draggedTask = task;
        this.classList.add('dragging');
    });
    
    card.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        draggedTask = null;
    });
    
    // Evento para editar al hacer clic
    card.addEventListener('click', function() {
        openKanbanModal(task);
    });
    
    return card;
}

// Configurar eventos de Kanban
function setupKanban() {
    // Configurar eventos de arrastrar y soltar en columnas
    const columns = document.querySelectorAll('.kanban-cards');
    
    columns.forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        column.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        column.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            if (draggedTask) {
                // Determinar nuevo estado según la columna
                let newStatus = '';
                const columnId = this.parentElement.id;
                
                if (columnId === 'pending-column') newStatus = 'pendiente';
                else if (columnId === 'inprogress-column') newStatus = 'en-proceso';
                else if (columnId === 'approved-column') newStatus = 'aprobada';
                else if (columnId === 'rejected-column') newStatus = 'rechazada';
                
                // Actualizar estado de la tarea
                const taskIndex = kanbanTasks.findIndex(t => t.id === draggedTask.id);
                if (taskIndex !== -1) {
                    kanbanTasks[taskIndex].status = newStatus;
                    
                    // Recargar panel Kanban
                    loadKanbanBoard();
                    
                    // Mostrar notificación
                    showNotification(`Tarea movida a "${newStatus}"`, 'success');
                }
            }
        });
    });
    
    // Configurar botones para agregar tareas
    const addButtons = document.querySelectorAll('.kanban-add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            openKanbanModal(null, status);
        });
    });
}

// Configurar eventos de modales
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Botón para agregar horas extras
    document.getElementById('add-overtime-btn').addEventListener('click', function() {
        openOvertimeModal();
    });
    
    // Botón para agregar empleado
    document.getElementById('add-employee-btn').addEventListener('click', function() {
        openEmployeeModal();
    });
    
    // Cerrar modales al hacer clic en el botón de cerrar o fuera del modal
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Cargar lista de empleados en el select de horas extras
    loadEmployeeSelect();
}

// Cargar select de empleados
function loadEmployeeSelect() {
    const select = document.getElementById('employee-select');
    select.innerHTML = '<option value="">Seleccionar empleado...</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.name} (${employee.department}) - €${employee.hourlyRate}/h`;
        select.appendChild(option);
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
    
    // Formulario de tarea Kanban
    document.getElementById('kanban-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveKanbanTask();
    });
    
    // Botón eliminar tarea Kanban
    document.getElementById('delete-kanban-btn').addEventListener('click', function() {
        const taskId = parseInt(this.dataset.taskId);
        deleteKanbanTask(taskId);
    });
}

// Configurar búsqueda de empleados
function setupSearch() {
    const searchInput = document.getElementById('employee-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const tableBody = document.getElementById('employees-table');
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const department = row.cells[1].textContent.toLowerCase();
            
            if (name.includes(searchTerm) || department.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Configurar botones de exportación
function setupExportButtons() {
    // Botón PDF
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', exportToPDF);
    }
    
    // Botón Excel
    const excelBtn = document.getElementById('export-excel-btn');
    if (excelBtn) {
        excelBtn.addEventListener('click', exportToExcelXLSX);
    }
    
    // Botón Gráfico
    const chartBtn = document.getElementById('generate-chart-btn');
    if (chartBtn) {
        chartBtn.addEventListener('click', function() {
            showNotification('Función de generación de gráficos personalizados en desarrollo', 'info');
        });
    }
}

// Abrir modal de horas extras
function openOvertimeModal(overtime = null) {
    const modal = document.getElementById('overtime-modal');
    const form = document.getElementById('overtime-form');
    const modalTitle = modal.querySelector('h3');
    
    if (overtime) {
        // Modo edición
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Horas Extras';
        form.dataset.id = overtime.id;
        
        document.getElementById('employee-select').value = overtime.employeeId;
        document.getElementById('overtime-date').value = overtime.date;
        document.getElementById('overtime-hours').value = overtime.hours;
        document.getElementById('overtime-rate').value = overtime.rate;
        document.getElementById('overtime-reason').value = overtime.reason;
        document.getElementById('overtime-status').value = overtime.status;
    } else {
        // Modo creación
        modalTitle.innerHTML = '<i class="fas fa-clock"></i> Registrar Horas Extras';
        form.reset();
        delete form.dataset.id;
        
        // Establecer fecha por defecto (hoy)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('overtime-date').value = today;
        
        // Si hay un empleado seleccionado, usar su tarifa por defecto
        const employeeSelect = document.getElementById('employee-select');
        employeeSelect.addEventListener('change', function() {
            if (this.value) {
                const employee = employees.find(emp => emp.id === parseInt(this.value));
                if (employee) {
                    document.getElementById('overtime-rate').value = employee.hourlyRate;
                }
            }
        });
    }
    
    modal.classList.add('active');
}

// Guardar horas extras
function saveOvertime() {
    const form = document.getElementById('overtime-form');
    const employeeId = parseInt(document.getElementById('employee-select').value);
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        showNotification('Por favor, seleccione un empleado válido', 'error');
        return;
    }
    
    const hours = parseFloat(document.getElementById('overtime-hours').value);
    const rate = parseFloat(document.getElementById('overtime-rate').value);
    const amount = hours * rate;
    
    const overtimeData = {
        id: form.dataset.id ? parseInt(form.dataset.id) : currentOvertimeId++,
        employeeId: employeeId,
        employeeName: employee.name,
        date: document.getElementById('overtime-date').value,
        hours: hours,
        rate: rate,
        amount: amount,
        reason: document.getElementById('overtime-reason').value,
        status: document.getElementById('overtime-status').value
    };
    
    if (form.dataset.id) {
        // Actualizar registro existente
        const index = overtimeRecords.findIndex(record => record.id === overtimeData.id);
        if (index !== -1) {
            // Obtener el registro anterior
            const oldRecord = overtimeRecords[index];
            
            // Actualizar estadísticas del empleado
            const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
            if (employeeIndex !== -1) {
                if (oldRecord.status === 'aprobada' && overtimeData.status === 'aprobada') {
                    // Si ambos son aprobados, actualizar diferencia
                    employees[employeeIndex].overtime += (overtimeData.hours - oldRecord.hours);
                    employees[employeeIndex].overtimeAmount += (overtimeData.amount - oldRecord.amount);
                } else if (oldRecord.status === 'aprobada' && overtimeData.status !== 'aprobada') {
                    // Si antes estaba aprobado y ahora no, restar
                    employees[employeeIndex].overtime -= oldRecord.hours;
                    employees[employeeIndex].overtimeAmount -= oldRecord.amount;
                } else if (oldRecord.status !== 'aprobada' && overtimeData.status === 'aprobada') {
                    // Si antes no estaba aprobado y ahora sí, sumar
                    employees[employeeIndex].overtime += overtimeData.hours;
                    employees[employeeIndex].overtimeAmount += overtimeData.amount;
                }
            }
            
            overtimeRecords[index] = overtimeData;
            showNotification('Horas extras actualizadas correctamente', 'success');
        }
    } else {
        // Agregar nuevo registro
        overtimeRecords.push(overtimeData);
        
        // Actualizar horas acumuladas del empleado si está aprobado
        const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
        if (employeeIndex !== -1 && overtimeData.status === 'aprobada') {
            employees[employeeIndex].overtime += overtimeData.hours;
            employees[employeeIndex].overtimeAmount += overtimeData.amount;
            employees[employeeIndex].lastOvertime = overtimeData.date;
        }
        
        showNotification('Horas extras registradas correctamente', 'success');
    }
    
    // Cerrar modal y actualizar datos
    document.getElementById('overtime-modal').classList.remove('active');
    loadDashboardData();
    loadEmployeesTable();
}

// Editar horas extras
function editOvertime(id) {
    const overtime = overtimeRecords.find(record => record.id === id);
    if (overtime) {
        openOvertimeModal(overtime);
    }
}

// Eliminar horas extras
function deleteOvertime(id) {
    if (confirm('¿Está seguro de que desea eliminar este registro de horas extras?')) {
        const index = overtimeRecords.findIndex(record => record.id === id);
        if (index !== -1) {
            // Obtener el registro para actualizar estadísticas del empleado
            const record = overtimeRecords[index];
            const employeeIndex = employees.findIndex(emp => emp.id === record.employeeId);
            
            // Eliminar el registro
            overtimeRecords.splice(index, 1);
            
            // Actualizar estadísticas del empleado si estaba aprobado
            if (employeeIndex !== -1 && record.status === 'aprobada') {
                employees[employeeIndex].overtime -= record.hours;
                employees[employeeIndex].overtimeAmount -= record.amount;
            }
            
            showNotification('Registro eliminado correctamente', 'success');
            loadDashboardData();
            loadEmployeesTable();
        }
    }
}

// Abrir modal de empleado
function openEmployeeModal(employee = null) {
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('employee-form');
    const modalTitle = modal.querySelector('h3');
    
    if (employee) {
        // Modo edición
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Empleado';
        form.dataset.id = employee.id;
        
        document.getElementById('employee-name').value = employee.name;
        document.getElementById('employee-department').value = employee.department;
        document.getElementById('employee-email').value = employee.email;
        document.getElementById('employee-phone').value = employee.phone;
        document.getElementById('employee-position').value = employee.position;
        document.getElementById('employee-hourly-rate').value = employee.hourlyRate;
    } else {
        // Modo creación
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Agregar Empleado';
        form.reset();
        delete form.dataset.id;
    }
    
    modal.classList.add('active');
}

// Guardar empleado
function saveEmployee() {
    const form = document.getElementById('employee-form');
    
    const employeeData = {
        id: form.dataset.id ? parseInt(form.dataset.id) : currentEmployeeId++,
        name: document.getElementById('employee-name').value,
        department: document.getElementById('employee-department').value,
        email: document.getElementById('employee-email').value,
        phone: document.getElementById('employee-phone').value,
        position: document.getElementById('employee-position').value,
        hourlyRate: parseFloat(document.getElementById('employee-hourly-rate').value),
        overtime: 0,
        overtimeAmount: 0,
        lastOvertime: null
    };
    
    if (form.dataset.id) {
        // Actualizar empleado existente
        const index = employees.findIndex(emp => emp.id === employeeData.id);
        if (index !== -1) {
            // Mantener los datos de horas extras
            employeeData.overtime = employees[index].overtime;
            employeeData.overtimeAmount = employees[index].overtimeAmount;
            employeeData.lastOvertime = employees[index].lastOvertime;
            
            employees[index] = employeeData;
            showNotification('Empleado actualizado correctamente', 'success');
        }
    } else {
        // Agregar nuevo empleado
        employees.push(employeeData);
        showNotification('Empleado agregado correctamente', 'success');
    }
    
    // Cerrar modal y actualizar datos
    document.getElementById('employee-modal').classList.remove('active');
    loadDashboardData();
    loadEmployeesTable();
    loadEmployeeSelect();
}

// Ver empleado
function viewEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        alert(`Información del empleado:\n\nNombre: ${employee.name}\nDepartamento: ${employee.department}\nCargo: ${employee.position}\nEmail: ${employee.email}\nTeléfono: ${employee.phone}\nTarifa hora extra: €${employee.hourlyRate.toFixed(2)}\nHoras extras acumuladas: ${employee.overtime}\nImporte total: €${employee.overtimeAmount.toFixed(2)}`);
    }
}

// Editar empleado
function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        openEmployeeModal(employee);
    }
}

// Eliminar empleado
function deleteEmployee(id) {
    if (confirm('¿Está seguro de que desea eliminar este empleado?\n\nNota: Esta acción también eliminará todos sus registros de horas extras.')) {
        const employeeIndex = employees.findIndex(emp => emp.id === id);
        
        if (employeeIndex !== -1) {
            // Obtener nombre del empleado para el mensaje
            const employeeName = employees[employeeIndex].name;
            
            // Eliminar empleado
            employees.splice(employeeIndex, 1);
            
            // Eliminar registros de horas extras del empleado
            overtimeRecords = overtimeRecords.filter(record => record.employeeId !== id);
            
            // Mostrar notificación
            showNotification(`Empleado "${employeeName}" eliminado correctamente`, 'success');
            
            // Actualizar datos
            loadDashboardData();
            loadEmployeesTable();
            loadEmployeeSelect();
        }
    }
}

// Abrir modal de tarea Kanban
function openKanbanModal(task = null, status = 'pendiente') {
    const modal = document.getElementById('kanban-modal');
    const form = document.getElementById('kanban-form');
    const modalTitle = document.getElementById('kanban-modal-title');
    const deleteBtn = document.getElementById('delete-kanban-btn');
    
    // Cargar lista de empleados en el select
    const assigneeSelect = document.getElementById('kanban-assignee');
    assigneeSelect.innerHTML = '<option value="">Sin asignar</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.name;
        option.textContent = employee.name;
        assigneeSelect.appendChild(option);
    });
    
    if (task) {
        // Modo edición
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Tarea';
        form.dataset.id = task.id;
        deleteBtn.dataset.taskId = task.id;
        deleteBtn.style.display = 'block';
        
        document.getElementById('kanban-title').value = task.title;
        document.getElementById('kanban-description').value = task.description;
        document.getElementById('kanban-assignee').value = task.assignee || '';
        document.getElementById('kanban-priority').value = task.priority;
        document.getElementById('kanban-status').value = task.status;
    } else {
        // Modo creación
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Nueva Tarea';
        form.reset();
        delete form.dataset.id;
        deleteBtn.style.display = 'none';
        
        document.getElementById('kanban-status').value = status;
    }
    
    modal.classList.add('active');
}

// Guardar tarea Kanban
function saveKanbanTask() {
    const form = document.getElementById('kanban-form');
    
    const taskData = {
        id: form.dataset.id ? parseInt(form.dataset.id) : currentKanbanId++,
        title: document.getElementById('kanban-title').value,
        description: document.getElementById('kanban-description').value,
        assignee: document.getElementById('kanban-assignee').value || '',
        priority: document.getElementById('kanban-priority').value,
        status: document.getElementById('kanban-status').value
    };
    
    if (form.dataset.id) {
        // Actualizar tarea existente
        const index = kanbanTasks.findIndex(task => task.id === taskData.id);
        if (index !== -1) {
            kanbanTasks[index] = taskData;
            showNotification('Tarea actualizada correctamente', 'success');
        }
    } else {
        // Agregar nueva tarea
        kanbanTasks.push(taskData);
        showNotification('Tarea creada correctamente', 'success');
    }
    
    // Cerrar modal y actualizar panel Kanban
    document.getElementById('kanban-modal').classList.remove('active');
    loadKanbanBoard();
}

// Eliminar tarea Kanban
function deleteKanbanTask(id) {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
        const index = kanbanTasks.findIndex(task => task.id === id);
        if (index !== -1) {
            kanbanTasks.splice(index, 1);
            showNotification('Tarea eliminada correctamente', 'success');
            
            // Cerrar modal y actualizar panel Kanban
            document.getElementById('kanban-modal').classList.remove('active');
            loadKanbanBoard();
        }
    }
}

// Exportar a PDF
function exportToPDF() {
    showNotification('Generando reporte PDF...', 'info');
    
    // Crear nuevo documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Horas Extras", 105, 20, { align: "center" });
    
    // Información de la empresa
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Gestor de Horas Extras", 105, 30, { align: "center" });
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 105, 35, { align: "center" });
    
    // Estadísticas
    const totalAprobadas = overtimeRecords
        .filter(record => record.status === 'aprobada')
        .reduce((sum, record) => sum + record.amount, 0);
    const totalPendientes = overtimeRecords.filter(record => record.status === 'pendiente').length;
    
    doc.setFont("helvetica", "bold");
    doc.text("Resumen General", 14, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`Total registros: ${overtimeRecords.length}`, 14, 52);
    doc.text(`Importe total aprobado: €${totalAprobadas.toFixed(2)}`, 14, 58);
    doc.text(`Registros pendientes: ${totalPendientes}`, 14, 64);
    doc.text(`Total empleados: ${employees.length}`, 14, 70);
    
    // Preparar datos para la tabla
    const tableData = prepareOvertimeDataForPDF();
    
    // Configurar la tabla
    doc.autoTable({
        head: [['Empleado', 'Departamento', 'Fecha', 'Horas', 'Importe/H', 'Total', 'Motivo', 'Estado']],
        body: tableData,
        startY: 80,
        theme: 'grid',
        headStyles: {
            fillColor: [74, 111, 165],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 12 },
            4: { cellWidth: 15 },
            5: { cellWidth: 15 },
            6: { cellWidth: 40 },
            7: { cellWidth: 20 }
        },
        margin: { top: 80 }
    });
    
    // Agregar página de resumen si hay muchas filas
    const finalY = doc.lastAutoTable.finalY || 80;
    
    if (finalY > 250) {
        doc.addPage();
        addSummaryPage(doc, finalY);
    } else {
        // Agregar resumen al final de la página actual
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Resumen por Departamento", 14, finalY + 20);
        
        // Calcular importe por departamento
        const departmentSummary = {};
        overtimeRecords.forEach(record => {
            const employee = employees.find(emp => emp.id === record.employeeId);
            if (employee && record.status === 'aprobada') {
                if (!departmentSummary[employee.department]) {
                    departmentSummary[employee.department] = { hours: 0, amount: 0 };
                }
                departmentSummary[employee.department].hours += record.hours;
                departmentSummary[employee.department].amount += record.amount;
            }
        });
        
        let yPos = finalY + 28;
        Object.entries(departmentSummary).forEach(([dept, data], index) => {
            if (yPos < 280) {
                doc.setFont("helvetica", "normal");
                doc.text(`${dept}: ${data.hours.toFixed(2)}h - €${data.amount.toFixed(2)}`, 20, yPos);
                yPos += 7;
            }
        });
    }
    
    // Agregar número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Página ${i} de ${pageCount}`, 195, 287, { align: "right" });
    }
    
    // Guardar el PDF
    const fileName = `reporte-horas-extras-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showNotification('Reporte PDF generado correctamente', 'success');
}

// Preparar datos para PDF
function prepareOvertimeDataForPDF() {
    // Ordenar registros por fecha (más reciente primero)
    const sortedRecords = [...overtimeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sortedRecords.map(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('es-ES');
        
        // Obtener departamento del empleado
        const employee = employees.find(emp => emp.id === record.employeeId);
        const department = employee ? employee.department : 'N/A';
        
        let statusText = '';
        switch(record.status) {
            case 'pendiente': statusText = 'Pendiente'; break;
            case 'aprobada': statusText = 'Aprobada'; break;
            case 'rechazada': statusText = 'Rechazada'; break;
        }
        
        // Acortar motivo si es muy largo
        let motivo = record.reason;
        if (motivo.length > 50) {
            motivo = motivo.substring(0, 47) + '...';
        }
        
        return [
            record.employeeName,
            department,
            formattedDate,
            record.hours.toString(),
            '€' + record.rate.toFixed(2),
            '€' + record.amount.toFixed(2),
            motivo,
            statusText
        ];
    });
}

// Agregar página de resumen
function addSummaryPage(doc, yPos) {
    // Resumen por departamento
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen por Departamento", 105, 20, { align: "center" });
    
    // Calcular importe por departamento
    const departmentSummary = {};
    overtimeRecords.forEach(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        if (employee && record.status === 'aprobada') {
            if (!departmentSummary[employee.department]) {
                departmentSummary[employee.department] = { hours: 0, amount: 0 };
            }
            departmentSummary[employee.department].hours += record.hours;
            departmentSummary[employee.department].amount += record.amount;
        }
    });
    
    // Crear tabla de resumen
    const summaryData = Object.entries(departmentSummary).map(([dept, data]) => [
        dept,
        data.hours.toFixed(2),
        '€' + data.amount.toFixed(2)
    ]);
    
    doc.autoTable({
        head: [['Departamento', 'Horas Aprobadas', 'Importe Total']],
        body: summaryData,
        startY: 30,
        theme: 'grid',
        headStyles: {
            fillColor: [107, 142, 35],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10
        }
    });
    
    // Resumen por empleado
    const summaryY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top 5 Empleados por Importe", 105, summaryY, { align: "center" });
    
    // Calcular top 5 empleados por importe
    const employeeSummary = {};
    overtimeRecords.forEach(record => {
        if (record.status === 'aprobada') {
            if (!employeeSummary[record.employeeName]) {
                employeeSummary[record.employeeName] = { hours: 0, amount: 0 };
            }
            employeeSummary[record.employeeName].hours += record.hours;
            employeeSummary[record.employeeName].amount += record.amount;
        }
    });
    
    const topEmployees = Object.entries(employeeSummary)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(emp => [emp.name, emp.hours.toFixed(2), '€' + emp.amount.toFixed(2)]);
    
    doc.autoTable({
        head: [['Empleado', 'Horas', 'Importe Total']],
        body: topEmployees,
        startY: summaryY + 10,
        theme: 'grid',
        headStyles: {
            fillColor: [139, 69, 19],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10
        }
    });
}

// Exportar a Excel (.xlsx) usando SheetJS
function exportToExcelXLSX() {
    showNotification('Generando archivo Excel (.xlsx)...', 'info');
    
    try {
        // Preparar datos para Excel
        const wb = XLSX.utils.book_new();
        
        // Hoja 1: Horas Extras
        const overtimeData = prepareOvertimeDataForExcel();
        const ws1 = XLSX.utils.json_to_sheet(overtimeData);
        XLSX.utils.book_append_sheet(wb, ws1, "Horas Extras");
        
        // Hoja 2: Resumen por Departamento
        const departmentData = prepareDepartmentDataForExcel();
        const ws2 = XLSX.utils.json_to_sheet(departmentData);
        XLSX.utils.book_append_sheet(wb, ws2, "Resumen por Depto");
        
        // Hoja 3: Resumen por Empleado
        const employeeData = prepareEmployeeDataForExcel();
        const ws3 = XLSX.utils.json_to_sheet(employeeData);
        XLSX.utils.book_append_sheet(wb, ws3, "Resumen por Empleado");
        
        // Hoja 4: Metadatos
        const totalApprovedAmount = overtimeRecords
            .filter(r => r.status === 'aprobada')
            .reduce((sum, r) => sum + r.amount, 0);
        
        const metadata = [{
            "Reporte": "Horas Extras",
            "Fecha de Generación": new Date().toLocaleDateString('es-ES'),
            "Total Registros": overtimeRecords.length,
            "Horas Aprobadas": overtimeRecords
                .filter(r => r.status === 'aprobada')
                .reduce((sum, r) => sum + r.hours, 0).toFixed(2),
            "Importe Total Aprobado": '€' + totalApprovedAmount.toFixed(2),
            "Total Empleados": employees.length
        }];
        const ws4 = XLSX.utils.json_to_sheet(metadata);
        XLSX.utils.book_append_sheet(wb, ws4, "Información");
        
        // Generar nombre de archivo
        const fileName = `reporte-horas-extras-${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Escribir archivo y descargar
        XLSX.writeFile(wb, fileName);
        
        showNotification('Archivo Excel generado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al generar Excel:', error);
        showNotification('Error al generar el archivo Excel', 'error');
    }
}

// Preparar datos de horas extras para Excel
function prepareOvertimeDataForExcel() {
    // Ordenar registros por fecha
    const sortedRecords = [...overtimeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sortedRecords.map(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('es-ES');
        
        // Obtener departamento del empleado
        const employee = employees.find(emp => emp.id === record.employeeId);
        const department = employee ? employee.department : 'N/A';
        
        let statusText = '';
        switch(record.status) {
            case 'pendiente': statusText = 'Pendiente'; break;
            case 'aprobada': statusText = 'Aprobada'; break;
            case 'rechazada': statusText = 'Rechazada'; break;
        }
        
        return {
            "Empleado": record.employeeName,
            "Departamento": department,
            "Fecha": formattedDate,
            "Horas": record.hours,
            "Importe por Hora": record.rate,
            "Importe Total": record.amount,
            "Motivo": record.reason,
            "Estado": statusText
        };
    });
}

// Preparar datos de resumen por departamento para Excel
function prepareDepartmentDataForExcel() {
    // Calcular importe por departamento
    const departmentSummary = {};
    
    overtimeRecords.forEach(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        if (employee && record.status === 'aprobada') {
            if (!departmentSummary[employee.department]) {
                departmentSummary[employee.department] = { hours: 0, amount: 0 };
            }
            departmentSummary[employee.department].hours += record.hours;
            departmentSummary[employee.department].amount += record.amount;
        }
    });
    
    return Object.entries(departmentSummary).map(([department, data]) => ({
        "Departamento": department,
        "Horas Extras Aprobadas": data.hours,
        "Importe Total": data.amount,
        "Porcentaje": ((data.amount / Object.values(departmentSummary).reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(2) + "%"
    }));
}

// Preparar datos de resumen por empleado para Excel
function prepareEmployeeDataForExcel() {
    // Calcular importe por empleado
    const employeeSummary = {};
    
    overtimeRecords.forEach(record => {
        if (record.status === 'aprobada') {
            if (!employeeSummary[record.employeeName]) {
                employeeSummary[record.employeeName] = { hours: 0, amount: 0 };
            }
            employeeSummary[record.employeeName].hours += record.hours;
            employeeSummary[record.employeeName].amount += record.amount;
        }
    });
    
    return Object.entries(employeeSummary)
        .map(([employee, data]) => ({
            "Empleado": employee,
            "Horas Extras Aprobadas": data.hours,
            "Importe Total": data.amount
        }))
        .sort((a, b) => b["Importe Total"] - a["Importe Total"]);
}

// Cargar gráficos
function loadCharts() {
    // Gráfico de horas extras por departamento
    const departmentChartCanvas = document.getElementById('departmentChart');
    if (departmentChartCanvas) {
        createDepartmentChart();
    }
    
    // Gráfico de horas extras mensuales
    const monthlyChartCanvas = document.getElementById('monthlyChart');
    if (monthlyChartCanvas) {
        createMonthlyChart();
    }
    
    // Gráfico de importe por mes
    const amountChartCanvas = document.getElementById('amountChart');
    if (amountChartCanvas) {
        createAmountChart();
    }
    
    // Gráfico de top empleados
    const topEmployeesChartCanvas = document.getElementById('topEmployeesChart');
    if (topEmployeesChartCanvas) {
        createTopEmployeesChart();
    }
}

// Crear gráfico de horas por departamento
function createDepartmentChart() {
    const ctx = document.getElementById('departmentChart').getContext('2d');
    
    // Calcular horas por departamento
    const departmentHours = {};
    
    overtimeRecords.forEach(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        if (employee && record.status === 'aprobada') {
            if (!departmentHours[employee.department]) {
                departmentHours[employee.department] = 0;
            }
            departmentHours[employee.department] += record.hours;
        }
    });
    
    const departments = Object.keys(departmentHours);
    const hours = Object.values(departmentHours);
    
    // Colores para los departamentos
    const colors = [
        'rgba(74, 111, 165, 0.7)',
        'rgba(107, 142, 35, 0.7)',
        'rgba(218, 165, 32, 0.7)',
        'rgba(139, 69, 19, 0.7)',
        'rgba(72, 61, 139, 0.7)',
        'rgba(220, 53, 69, 0.7)'
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: departments,
            datasets: [{
                data: hours,
                backgroundColor: colors.slice(0, departments.length),
                borderColor: document.body.classList.contains('dark-mode') ? 
                    ['#2c3e50', '#2c3e50', '#2c3e50', '#2c3e50', '#2c3e50', '#2c3e50'] : 
                    ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Horas Extras por Departamento',
                    color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Crear gráfico de horas mensuales
function createMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Datos de ejemplo para los últimos 6 meses
    const months = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    const hours = [45, 62, 78, 95, 110, 147.5];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Horas Extras',
                data: hours,
                borderColor: 'rgba(74, 111, 165, 1)',
                backgroundColor: 'rgba(74, 111, 165, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333'
                    }
                },
                title: {
                    display: true,
                    text: 'Evolución de Horas Extras',
                    color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333'
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333'
                    }
                }
            }
        }
    });
}

// Crear gráfico de importe por mes
function createAmountChart() {
    const ctx = document.getElementById('amountChart').getContext('2d');
    
    // Datos de ejemplo para los últimos 6 meses
    const months = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    const amounts = [2250, 3100, 3900, 4750, 5500, 7375]; // Asumiendo €50/h de promedio
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Importe (€)',
                data: amounts,
                backgroundColor: 'rgba(107, 142, 35, 0.7)',
                borderColor: 'rgba(107, 142, 35, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Importe Total por Mes',
                    color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333'
                    }
                }
            }
        }
    });
}

// Crear gráfico de top empleados por importe
function createTopEmployeesChart() {
    const ctx = document.getElementById('topEmployeesChart').getContext('2d');
    
    // Obtener top 5 empleados con más importe
    const employeeSummary = {};
    
    overtimeRecords.forEach(record => {
        if (record.status === 'aprobada') {
            if (!employeeSummary[record.employeeName]) {
                employeeSummary[record.employeeName] = { hours: 0, amount: 0 };
            }
            employeeSummary[record.employeeName].hours += record.hours;
            employeeSummary[record.employeeName].amount += record.amount;
        }
    });
    
    // Convertir a array y ordenar por importe
    const employeeArray = Object.entries(employeeSummary)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    
    const employeeNames = employeeArray.map(emp => emp.name);
    const employeeAmounts = employeeArray.map(emp => emp.amount);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: employeeNames,
            datasets: [{
                label: 'Importe Total (€)',
                data: employeeAmounts,
                backgroundColor: 'rgba(139, 69, 19, 0.7)',
                borderColor: 'rgba(139, 69, 19, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 5 Empleados por Importe Total',
                    color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Agregar estilos para el botón de cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: auto;
    `;
    
    // Agregar animación de entrada
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Configurar evento para cerrar
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}