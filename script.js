// Datos iniciales de la aplicación - VACÍOS
let employees = [];
let overtimeRecords = [];
let kanbanTasks = [];

// Variables globales
let currentOvertimeId = 1;
let currentEmployeeId = 1;
let currentKanbanId = 1;
let draggedTask = null;
let overtimeFilterEmployeeId = '';
let overtimeFilterStatus = '';
let overtimeFilterDateFrom = '';
let overtimeFilterDateTo = '';
let employeeSearchTerm = '';

const PAGE_SIZE = 10;
let overtimeCurrentPage = 1;
let employeesCurrentPage = 1;

// ── Modal de confirmación ────────────────────────────────────────────────────
function showConfirmModal({ title = '¿Estás seguro?', message = '', warning = '', confirmText = 'Eliminar', danger = true, onConfirm, onCancel = null }) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    const warningEl = document.getElementById('confirm-warning');
    warningEl.textContent = warning;
    warningEl.style.display = warning ? 'block' : 'none';

    const okBtn = document.getElementById('confirm-ok-btn');
    okBtn.textContent = confirmText;
    okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;

    const wrapper = document.getElementById('confirm-icon-wrapper');
    const icon = document.getElementById('confirm-icon');
    if (danger) {
        wrapper.className = 'confirm-icon-wrapper';
        icon.className = 'fas fa-trash-alt';
    } else {
        wrapper.className = 'confirm-icon-wrapper confirm-warning-icon';
        icon.className = 'fas fa-exclamation-triangle';
    }

    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');

    const cleanup = () => {
        okBtn.removeEventListener('click', handleOk);
        cancelBtn.removeEventListener('click', handleCancel);
        modal.removeEventListener('click', handleBackdrop);
    };

    const handleOk = () => { modal.classList.remove('active'); cleanup(); onConfirm(); };
    const handleCancel = () => { modal.classList.remove('active'); cleanup(); if (onCancel) onCancel(); };
    const handleBackdrop = (e) => { if (e.target === modal) handleCancel(); };

    const cancelBtn = document.getElementById('confirm-cancel-btn');
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleBackdrop);
}

// ── Paginación ───────────────────────────────────────────────────────────────
function renderPagination(containerId, currentPage, totalPages, totalItems, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = totalItems > 0
            ? `<span class="pagination-info">${totalItems} registro${totalItems !== 1 ? 's' : ''}</span>`
            : '';
        return;
    }

    const from = (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, totalItems);

    container.innerHTML = `
        <span class="pagination-info">${from}–${to} de ${totalItems} registros</span>
        <div class="pagination-pages">
            <button class="pagination-btn" id="${containerId}-prev" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
            <button class="pagination-btn active">${currentPage} / ${totalPages}</button>
            <button class="pagination-btn" id="${containerId}-next" ${currentPage === totalPages ? 'disabled' : ''}>
                Siguiente <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    container.querySelector(`#${containerId}-prev`)?.addEventListener('click', () => onPageChange(currentPage - 1));
    container.querySelector(`#${containerId}-next`)?.addEventListener('click', () => onPageChange(currentPage + 1));
}

// ── Estado vacío ─────────────────────────────────────────────────────────────
function emptyStateHtml(icon, title, desc, btnText = '', btnAction = '') {
    const btn = btnText
        ? `<button class="btn btn-primary" onclick="${btnAction}"><i class="fas fa-plus"></i> ${btnText}</button>`
        : '';
    return `
        <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-${icon}"></i></div>
            <p class="empty-state-title">${title}</p>
            <p class="empty-state-desc">${desc}</p>
            ${btn}
        </div>`;
}

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
}

// Cargar datos guardados del localStorage
function loadSavedData() {
    // Intentar cargar empleados
    const savedEmployees = localStorage.getItem('overtimeEmployees');
    if (savedEmployees) {
        try {
            employees = JSON.parse(savedEmployees);
            // Actualizar el ID actual basado en el último empleado
            if (employees.length > 0) {
                currentEmployeeId = Math.max(...employees.map(e => e.id)) + 1;
            }
        } catch (e) {
            console.error('Error al cargar empleados:', e);
            employees = [];
        }
    }
    
    // Intentar cargar registros de horas extras
    const savedOvertime = localStorage.getItem('overtimeRecords');
    if (savedOvertime) {
        try {
            overtimeRecords = JSON.parse(savedOvertime);
            // Actualizar el ID actual basado en el último registro
            if (overtimeRecords.length > 0) {
                currentOvertimeId = Math.max(...overtimeRecords.map(r => r.id)) + 1;
            }
        } catch (e) {
            console.error('Error al cargar registros de horas extras:', e);
            overtimeRecords = [];
        }
    }
    
    // Intentar cargar tareas Kanban
    const savedKanban = localStorage.getItem('kanbanTasks');
    if (savedKanban) {
        try {
            kanbanTasks = JSON.parse(savedKanban);
            // Actualizar el ID actual basado en la última tarea
            if (kanbanTasks.length > 0) {
                currentKanbanId = Math.max(...kanbanTasks.map(t => t.id)) + 1;
            }
        } catch (e) {
            console.error('Error al cargar tareas Kanban:', e);
            kanbanTasks = [];
        }
    }
}

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem('overtimeEmployees', JSON.stringify(employees));
    localStorage.setItem('overtimeRecords', JSON.stringify(overtimeRecords));
    localStorage.setItem('kanbanTasks', JSON.stringify(kanbanTasks));
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

// Cargar datos del dashboard
function loadDashboardData() {
    // Calcular estadísticas (manejar arrays vacíos)
    const totalEmployees = employees.length;
    const totalOvertime = overtimeRecords
        .filter(record => record.status === 'aprobada' || record.status === 'pagada')
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

    // Aplicar filtros
    let filteredRecords = [...overtimeRecords];
    if (overtimeFilterEmployeeId) {
        filteredRecords = filteredRecords.filter(r => r.employeeId === parseInt(overtimeFilterEmployeeId));
    }
    if (overtimeFilterStatus) {
        filteredRecords = filteredRecords.filter(r => r.status === overtimeFilterStatus);
    }
    if (overtimeFilterDateFrom) {
        filteredRecords = filteredRecords.filter(r => r.date >= overtimeFilterDateFrom);
    }
    if (overtimeFilterDateTo) {
        filteredRecords = filteredRecords.filter(r => r.date <= overtimeFilterDateTo);
    }

    if (filteredRecords.length === 0) {
        const row = document.createElement('tr');
        if (overtimeRecords.length === 0) {
            row.innerHTML = `<td colspan="9">${emptyStateHtml('clock', 'Aún no hay horas extras registradas', 'Empieza registrando las primeras horas extras de tu equipo.', 'Registrar horas', "document.getElementById('add-overtime-btn').click()")}</td>`;
        } else {
            row.innerHTML = `<td colspan="9">${emptyStateHtml('filter', 'Sin resultados', 'No hay registros que coincidan con los filtros seleccionados.')}</td>`;
        }
        tableBody.appendChild(row);
        const selectAll = document.getElementById('select-all-overtime');
        if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }
        updateBulkDeleteToolbar();
        document.getElementById('overtime-pagination').innerHTML = '';
        return;
    }

    // Ordenar por fecha (más reciente primero)
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginación
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (overtimeCurrentPage > totalPages) overtimeCurrentPage = totalPages;
    const pageStart = (overtimeCurrentPage - 1) * PAGE_SIZE;
    filteredRecords = filteredRecords.slice(pageStart, pageStart + PAGE_SIZE);

    filteredRecords.forEach(record => {
        const row = document.createElement('tr');

        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

        let statusClass = '';
        let statusText = '';
        switch(record.status) {
            case 'pendiente': statusClass = 'status-pendiente'; statusText = 'Pendiente'; break;
            case 'aprobada':  statusClass = 'status-aprobada';  statusText = 'Aprobada';  break;
            case 'pagada':    statusClass = 'status-pagada';    statusText = 'Pagada';    break;
            case 'rechazada': statusClass = 'status-rechazada'; statusText = 'Rechazada'; break;
        }

        row.innerHTML = `
            <td><input type="checkbox" class="overtime-checkbox" data-id="${record.id}"></td>
            <td>${record.employeeName}</td>
            <td>${formattedDate}</td>
            <td>${record.hours}</td>
            <td>€${record.rate.toFixed(2)}</td>
            <td>€${record.amount.toFixed(2)}</td>
            <td>${record.reason}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editOvertime(${record.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteOvertime(${record.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;

        row.querySelector('.overtime-checkbox').addEventListener('change', updateBulkDeleteToolbar);
        tableBody.appendChild(row);
    });

    renderPagination('overtime-pagination', overtimeCurrentPage, totalPages, totalItems, (page) => {
        overtimeCurrentPage = page;
        loadOvertimeTable();
    });

    updateBulkDeleteToolbar();
}

// Actualizar toolbar de borrado masivo y checkbox "seleccionar todos"
function updateBulkDeleteToolbar() {
    const checked = document.querySelectorAll('.overtime-checkbox:checked');
    const all = document.querySelectorAll('.overtime-checkbox');
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');
    const selectAll = document.getElementById('select-all-overtime');

    if (bulkActions) {
        if (checked.length > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = `${checked.length} seleccionado${checked.length !== 1 ? 's' : ''}`;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    if (selectAll && all.length > 0) {
        selectAll.checked = checked.length === all.length;
        selectAll.indeterminate = checked.length > 0 && checked.length < all.length;
    }
}

// Poblar el filtro de empleados de la tabla de horas
function populateOvertimeEmployeeFilter() {
    const select = document.getElementById('overtime-employee-filter');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Todos los empleados</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.name} (${emp.department})`;
        select.appendChild(option);
    });
    // Restaurar selección; si el empleado fue borrado, quedará en ""
    select.value = currentValue;
    if (select.value !== currentValue) {
        overtimeFilterEmployeeId = '';
    }
}

// Configurar filtros y selección múltiple de la tabla de horas
function setupOvertimeFilters() {
    const employeeFilter = document.getElementById('overtime-employee-filter');
    const statusFilter = document.getElementById('overtime-status-filter');
    const selectAll = document.getElementById('select-all-overtime');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');

    employeeFilter.addEventListener('change', function() {
        overtimeFilterEmployeeId = this.value;
        overtimeCurrentPage = 1;
        loadOvertimeTable();
    });

    statusFilter.addEventListener('change', function() {
        overtimeFilterStatus = this.value;
        overtimeCurrentPage = 1;
        loadOvertimeTable();
    });

    selectAll.addEventListener('change', function() {
        document.querySelectorAll('.overtime-checkbox').forEach(cb => cb.checked = this.checked);
        updateBulkDeleteToolbar();
    });

    deleteSelectedBtn.addEventListener('click', deleteSelectedOvertimes);

    document.getElementById('overtime-date-from').addEventListener('change', function() {
        overtimeFilterDateFrom = this.value;
        overtimeCurrentPage = 1;
        loadOvertimeTable();
    });

    document.getElementById('overtime-date-to').addEventListener('change', function() {
        overtimeFilterDateTo = this.value;
        overtimeCurrentPage = 1;
        loadOvertimeTable();
    });
}

// Eliminar múltiples registros seleccionados
function deleteSelectedOvertimes() {
    const checked = document.querySelectorAll('.overtime-checkbox:checked');
    if (checked.length === 0) return;

    const count = checked.length;
    const ids = new Set(Array.from(checked).map(cb => parseInt(cb.dataset.id)));

    showConfirmModal({
        title: `Eliminar ${count} registro${count !== 1 ? 's' : ''}`,
        message: `Se eliminarán ${count} registro${count !== 1 ? 's' : ''} de horas extras de forma permanente.`,
        warning: 'Las horas aprobadas o pagadas se descontarán de las estadísticas de cada empleado.',
        confirmText: `Eliminar ${count}`,
        danger: true,
        onConfirm: () => {
            overtimeRecords
                .filter(r => ids.has(r.id) && (r.status === 'aprobada' || r.status === 'pagada'))
                .forEach(record => {
                    const emp = employees.find(e => e.id === record.employeeId);
                    if (emp) { emp.overtime -= record.hours; emp.overtimeAmount -= record.amount; }
                });
            overtimeRecords = overtimeRecords.filter(r => !ids.has(r.id));
            saveData();
            showNotification(`${count} registro${count !== 1 ? 's eliminados' : ' eliminado'} correctamente`, 'success');
            loadDashboardData();
            loadEmployeesTable();
        }
    });
}

// Mostrar error de validación inline bajo un campo del formulario
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    formGroup.classList.add('has-error');
    let errorSpan = formGroup.querySelector('.field-error');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'field-error';
        field.after(errorSpan);
    }
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
    field.focus();
}

// Limpiar todos los errores de validación de un formulario
function clearFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

// Cargar tabla de empleados
function loadEmployeesTable() {
    const tableBody = document.getElementById('employees-table');
    tableBody.innerHTML = '';

    // Filtrar por término de búsqueda
    let filtered = employees;
    if (employeeSearchTerm) {
        filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(employeeSearchTerm) ||
            emp.department.toLowerCase().includes(employeeSearchTerm)
        );
    }

    if (filtered.length === 0) {
        const row = document.createElement('tr');
        if (employees.length === 0) {
            row.innerHTML = `<td colspan="6">${emptyStateHtml('users', 'Aún no hay empleados', 'Agrega el primer empleado para empezar a registrar horas extras.', 'Agregar empleado', "document.getElementById('add-employee-btn').click()")}</td>`;
        } else {
            row.innerHTML = `<td colspan="6">${emptyStateHtml('search', 'Sin resultados', 'No hay empleados que coincidan con la búsqueda.')}</td>`;
        }
        tableBody.appendChild(row);
        document.getElementById('employees-pagination').innerHTML = '';
        return;
    }

    // Paginación
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (employeesCurrentPage > totalPages) employeesCurrentPage = totalPages;
    const pageStart = (employeesCurrentPage - 1) * PAGE_SIZE;
    const pageRecords = filtered.slice(pageStart, pageStart + PAGE_SIZE);

    pageRecords.forEach(employee => {
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

    renderPagination('employees-pagination', employeesCurrentPage, totalPages, totalItems, (page) => {
        employeesCurrentPage = page;
        loadEmployeesTable();
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
            case 'pendiente':    columnId = 'pending-column';    break;
            case 'en-proceso':  columnId = 'inprogress-column'; break;
            case 'aprobada':    columnId = 'approved-column';   break;
            case 'rechazada':   columnId = 'rejected-column';   break;
        }

        document.getElementById(columnId).appendChild(card);
    });

    // Empty states por columna
    const emptyDefs = [
        { col: 'pending-column',    count: pendingCount,    icon: 'fa-inbox',        title: 'Sin tareas pendientes',  desc: 'Añade una nueva tarea con el botón +' },
        { col: 'inprogress-column', count: inProgressCount, icon: 'fa-spinner',      title: 'Nada en proceso',        desc: 'Arrastra una tarea aquí para iniciarla' },
        { col: 'approved-column',   count: approvedCount,   icon: 'fa-check-circle', title: 'Sin aprobadas',          desc: 'Las tareas completadas aparecerán aquí' },
        { col: 'rejected-column',   count: rejectedCount,   icon: 'fa-times-circle', title: 'Sin rechazadas',         desc: 'Las tareas descartadas aparecerán aquí' },
    ];
    emptyDefs.forEach(({ col, count, icon, title, desc }) => {
        if (count === 0) {
            const el = document.getElementById(col);
            el.innerHTML = `<div class="empty-state" style="padding:24px 12px"><i class="fas ${icon} empty-state-icon" style="font-size:1.6rem"></i><p class="empty-state-title" style="font-size:.9rem;margin:8px 0 4px">${title}</p><p class="empty-state-desc" style="font-size:.78rem">${desc}</p></div>`;
        }
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
                    
                    // Guardar cambios
                    saveData();
                    
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

    // Autorellenar tarifa al elegir empleado en el formulario de horas
    document.getElementById('employee-select').addEventListener('change', function() {
        if (this.value) {
            const emp = employees.find(e => e.id === parseInt(this.value));
            if (emp) document.getElementById('overtime-rate').value = emp.hourlyRate;
        }
    });
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

    populateOvertimeEmployeeFilter();
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
    document.getElementById('employee-search').addEventListener('input', function() {
        employeeSearchTerm = this.value.toLowerCase();
        employeesCurrentPage = 1;
        loadEmployeesTable();
    });
}

// Configurar botones de exportación
function setupExportButtons() {
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', exportToPDF);

    const excelBtn = document.getElementById('export-excel-btn');
    if (excelBtn) excelBtn.addEventListener('click', exportToExcelXLSX);

    const chartBtn = document.getElementById('generate-chart-btn');
    if (chartBtn) {
        chartBtn.addEventListener('click', function() {
            showNotification('Función de generación de gráficos personalizados en desarrollo', 'info');
        });
    }

    const backupBtn = document.getElementById('export-backup-btn');
    if (backupBtn) backupBtn.addEventListener('click', exportBackup);

    const importInput = document.getElementById('import-backup-input');
    if (importInput) {
        importInput.addEventListener('change', function() {
            if (this.files[0]) {
                importBackup(this.files[0]);
                this.value = ''; // permite reimportar el mismo archivo
            }
        });
    }
}

// Exportar todos los datos como JSON
function exportBackup() {
    const backup = {
        version: 1,
        exportDate: new Date().toISOString(),
        employees: employees,
        overtimeRecords: overtimeRecords,
        kanbanTasks: kanbanTasks
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-horas-extras-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Backup exportado correctamente', 'success');
}

function doImportBackup(backup) {
    employees = backup.employees;
    overtimeRecords = backup.overtimeRecords;
    kanbanTasks = backup.kanbanTasks || [];

    currentEmployeeId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    currentOvertimeId = overtimeRecords.length > 0 ? Math.max(...overtimeRecords.map(r => r.id)) + 1 : 1;
    currentKanbanId = kanbanTasks.length > 0 ? Math.max(...kanbanTasks.map(t => t.id)) + 1 : 1;

    overtimeFilterEmployeeId = '';
    overtimeFilterStatus = '';
    overtimeFilterDateFrom = '';
    overtimeFilterDateTo = '';
    overtimeCurrentPage = 1;
    employeesCurrentPage = 1;

    saveData();
    loadDashboardData();
    loadEmployeesTable();
    loadEmployeeSelect();
    loadOvertimeTable();
    loadKanbanBoard();
    loadCharts();

    showNotification(`Backup importado: ${employees.length} empleados, ${overtimeRecords.length} registros`, 'success');
}

// Importar datos desde un archivo JSON de backup
function importBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (!Array.isArray(backup.employees) || !Array.isArray(backup.overtimeRecords)) {
                showNotification('El archivo no tiene el formato correcto', 'error');
                return;
            }

            const exportDateStr = backup.exportDate
                ? new Date(backup.exportDate).toLocaleDateString('es-ES')
                : 'desconocida';

            showConfirmModal({
                title: 'Importar backup',
                message: `Se reemplazarán TODOS los datos actuales con los del backup del ${exportDateStr}.`,
                warning: `Contenido: ${backup.employees.length} empleados · ${backup.overtimeRecords.length} registros de horas · ${(backup.kanbanTasks || []).length} tareas Kanban`,
                confirmText: 'Importar',
                danger: false,
                onConfirm: () => doImportBackup(backup)
            });
        } catch (err) {
            showNotification('Error al leer el archivo de backup', 'error');
        }
    };
    reader.readAsText(file);
}

// Abrir modal de horas extras
function openOvertimeModal(overtime = null) {
    const modal = document.getElementById('overtime-modal');
    const form = document.getElementById('overtime-form');
    const modalTitle = modal.querySelector('h3');
    clearFieldErrors('overtime-form');
    
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
        
    }

    modal.classList.add('active');
}

// Guardar horas extras
function saveOvertime() {
    clearFieldErrors('overtime-form');

    const form = document.getElementById('overtime-form');
    const employeeId = parseInt(document.getElementById('employee-select').value);
    const employee = employees.find(emp => emp.id === employeeId);

    if (!employee) {
        showFieldError('employee-select', 'Selecciona un empleado válido');
        return;
    }

    const hours = parseFloat(document.getElementById('overtime-hours').value);
    const rate = parseFloat(document.getElementById('overtime-rate').value);
    const date = document.getElementById('overtime-date').value;

    let hasErrors = false;

    if (!hours || hours <= 0) {
        showFieldError('overtime-hours', 'Las horas deben ser un valor positivo');
        hasErrors = true;
    } else if (hours > 24) {
        showFieldError('overtime-hours', 'No se pueden registrar más de 24 horas en un día');
        hasErrors = true;
    }

    if (!rate || rate <= 0) {
        showFieldError('overtime-rate', 'El importe por hora debe ser mayor que cero');
        hasErrors = true;
    }

    if (!date) {
        showFieldError('overtime-date', 'La fecha es obligatoria');
        hasErrors = true;
    }

    if (hasErrors) return;

    // Detectar registro duplicado (mismo empleado y misma fecha)
    const currentId = form.dataset.id ? parseInt(form.dataset.id) : null;
    const duplicate = overtimeRecords.find(r => r.employeeId === employeeId && r.date === date && r.id !== currentId);
    if (duplicate) {
        const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('es-ES');
        const confirmed = confirm(
            `Ya existe un registro para ${employee.name} el ${dateFormatted}.\n\n` +
            `Registro existente: ${duplicate.hours}h — ${duplicate.status}\n\n` +
            `¿Quieres añadir otro registro para el mismo día?`
        );
        if (!confirmed) return;
    }

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
                const oldCounts = oldRecord.status === 'aprobada' || oldRecord.status === 'pagada';
                const newCounts = overtimeData.status === 'aprobada' || overtimeData.status === 'pagada';
                if (oldCounts && newCounts) {
                    employees[employeeIndex].overtime += (overtimeData.hours - oldRecord.hours);
                    employees[employeeIndex].overtimeAmount += (overtimeData.amount - oldRecord.amount);
                } else if (oldCounts && !newCounts) {
                    employees[employeeIndex].overtime -= oldRecord.hours;
                    employees[employeeIndex].overtimeAmount -= oldRecord.amount;
                } else if (!oldCounts && newCounts) {
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
        
        // Actualizar horas acumuladas del empleado si está aprobado o pagado
        const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
        if (employeeIndex !== -1 && (overtimeData.status === 'aprobada' || overtimeData.status === 'pagada')) {
            employees[employeeIndex].overtime += overtimeData.hours;
            employees[employeeIndex].overtimeAmount += overtimeData.amount;
            employees[employeeIndex].lastOvertime = overtimeData.date;
        }
        
        showNotification('Horas extras registradas correctamente', 'success');
    }
    
    // Guardar datos
    saveData();
    
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
    const record = overtimeRecords.find(r => r.id === id);
    if (!record) return;
    const dateStr = new Date(record.date + 'T12:00:00').toLocaleDateString('es-ES');
    const counts = record.status === 'aprobada' || record.status === 'pagada';

    showConfirmModal({
        title: 'Eliminar registro',
        message: `${record.employeeName} · ${record.hours}h el ${dateStr}`,
        warning: counts ? 'Se descontarán las horas de las estadísticas del empleado.' : '',
        confirmText: 'Eliminar',
        danger: true,
        onConfirm: () => {
            const index = overtimeRecords.findIndex(r => r.id === id);
            if (index === -1) return;
            const empIdx = employees.findIndex(e => e.id === record.employeeId);
            overtimeRecords.splice(index, 1);
            if (empIdx !== -1 && counts) {
                employees[empIdx].overtime -= record.hours;
                employees[empIdx].overtimeAmount -= record.amount;
            }
            saveData();
            showNotification('Registro eliminado correctamente', 'success');
            loadDashboardData();
            loadEmployeesTable();
        }
    });
}

// Abrir modal de empleado
function openEmployeeModal(employee = null) {
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('employee-form');
    const modalTitle = modal.querySelector('h3');
    clearFieldErrors('employee-form');
    
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
    clearFieldErrors('employee-form');

    const form = document.getElementById('employee-form');
    const currentId = form.dataset.id ? parseInt(form.dataset.id) : null;
    const email = document.getElementById('employee-email').value.trim();
    const hourlyRate = parseFloat(document.getElementById('employee-hourly-rate').value);

    let hasErrors = false;

    // Validar formato de email
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFieldError('employee-email', 'El formato del email no es válido');
            hasErrors = true;
        } else {
            // Detectar email duplicado
            const duplicate = employees.find(emp => emp.email === email && emp.id !== currentId);
            if (duplicate) {
                showFieldError('employee-email', `Este email ya está registrado (${duplicate.name})`);
                hasErrors = true;
            }
        }
    }

    // Validar tarifa
    if (!hourlyRate || hourlyRate <= 0) {
        showFieldError('employee-hourly-rate', 'La tarifa debe ser mayor que cero');
        hasErrors = true;
    }

    if (hasErrors) return;

    const employeeData = {
        id: currentId ?? currentEmployeeId++,
        name: document.getElementById('employee-name').value,
        department: document.getElementById('employee-department').value,
        email: email,
        phone: document.getElementById('employee-phone').value,
        position: document.getElementById('employee-position').value,
        hourlyRate: hourlyRate,
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
    
    // Guardar datos
    saveData();
    
    // Cerrar modal y actualizar datos
    document.getElementById('employee-modal').classList.remove('active');
    loadDashboardData();
    loadEmployeesTable();
    loadEmployeeSelect();
}

// Ver empleado — abre modal de ficha
function viewEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;

    // Iniciales para el avatar
    const initials = employee.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('view-avatar-initials').textContent = initials;
    document.getElementById('view-employee-name').textContent = employee.name;
    document.getElementById('view-employee-dept').textContent = employee.department;
    document.getElementById('view-employee-position').textContent = employee.position || '—';
    document.getElementById('view-employee-email').textContent = employee.email || '—';
    document.getElementById('view-employee-phone').textContent = employee.phone || '—';
    document.getElementById('view-employee-rate').textContent = `€${employee.hourlyRate.toFixed(2)}/h`;
    document.getElementById('view-employee-hours').textContent = `${employee.overtime.toFixed(1)} h`;
    document.getElementById('view-employee-amount').textContent = `€${employee.overtimeAmount.toFixed(2)}`;

    // Pendiente de pago: suma de registros "aprobada" (no pagados aún)
    const pending = overtimeRecords
        .filter(r => r.employeeId === id && r.status === 'aprobada')
        .reduce((sum, r) => sum + r.amount, 0);
    document.getElementById('view-employee-pending').textContent = `€${pending.toFixed(2)}`;

    // Últimos 6 registros del empleado
    const tbody = document.getElementById('view-employee-records-body');
    tbody.innerHTML = '';
    const records = overtimeRecords
        .filter(r => r.employeeId === id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-light);font-style:italic">Sin registros</td></tr>`;
    } else {
        records.forEach(r => {
            const statusLabels = { pendiente: 'Pendiente', aprobada: 'Aprobada', pagada: 'Pagada', rechazada: 'Rechazada' };
            const statusClasses = { pendiente: 'status-pendiente', aprobada: 'status-aprobada', pagada: 'status-pagada', rechazada: 'status-rechazada' };
            const date = new Date(r.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>${r.hours} h</td>
                <td>€${r.amount.toFixed(2)}</td>
                <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.reason}">${r.reason}</td>
                <td><span class="status-badge ${statusClasses[r.status] || ''}">${statusLabels[r.status] || r.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('employee-view-modal').classList.add('active');
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
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const recordCount = overtimeRecords.filter(r => r.employeeId === id).length;

    showConfirmModal({
        title: `Eliminar empleado`,
        message: `¿Eliminar a ${emp.name} (${emp.department})?`,
        warning: recordCount > 0
            ? `También se eliminarán ${recordCount} registro${recordCount !== 1 ? 's' : ''} de horas extras asociados. Esta acción no se puede deshacer.`
            : 'Esta acción no se puede deshacer.',
        confirmText: 'Eliminar empleado',
        danger: true,
        onConfirm: () => {
            const idx = employees.findIndex(e => e.id === id);
            if (idx === -1) return;
            employees.splice(idx, 1);
            overtimeRecords = overtimeRecords.filter(r => r.employeeId !== id);
            if (overtimeFilterEmployeeId === String(id)) overtimeFilterEmployeeId = '';
            saveData();
            showNotification(`Empleado "${emp.name}" eliminado correctamente`, 'success');
            loadDashboardData();
            loadEmployeesTable();
            loadEmployeeSelect();
        }
    });
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
    
    // Guardar datos
    saveData();
    
    // Cerrar modal y actualizar panel Kanban
    document.getElementById('kanban-modal').classList.remove('active');
    loadKanbanBoard();
}

// Eliminar tarea Kanban
function deleteKanbanTask(id) {
    const task = kanbanTasks.find(t => t.id === id);
    if (!task) return;

    showConfirmModal({
        title: 'Eliminar tarea',
        message: `¿Eliminar "${task.title}"?`,
        confirmText: 'Eliminar tarea',
        danger: true,
        onConfirm: () => {
            const index = kanbanTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                kanbanTasks.splice(index, 1);
                saveData();
                showNotification('Tarea eliminada correctamente', 'success');
                document.getElementById('kanban-modal').classList.remove('active');
                loadKanbanBoard();
            }
        }
    });
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
    
    if (tableData.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("No hay registros de horas extras para mostrar", 105, 90, { align: "center" });
    } else {
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
            case 'aprobada':  statusText = 'Aprobada';  break;
            case 'pagada':    statusText = 'Pagada';    break;
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

// Exportar a Excel (.xlsx) usando SheetJS
function exportToExcelXLSX() {
    showNotification('Generando archivo Excel (.xlsx)...', 'info');
    
    try {
        // Preparar datos para Excel
        const wb = XLSX.utils.book_new();
        
        // Hoja 1: Horas Extras
        const overtimeData = prepareOvertimeDataForExcel();
        if (overtimeData.length > 0) {
            const ws1 = XLSX.utils.json_to_sheet(overtimeData);
            XLSX.utils.book_append_sheet(wb, ws1, "Horas Extras");
        }
        
        // Hoja 2: Resumen por Departamento
        const departmentData = prepareDepartmentDataForExcel();
        if (departmentData.length > 0) {
            const ws2 = XLSX.utils.json_to_sheet(departmentData);
            XLSX.utils.book_append_sheet(wb, ws2, "Resumen por Depto");
        }
        
        // Hoja 3: Resumen por Empleado
        const employeeData = prepareEmployeeDataForExcel();
        if (employeeData.length > 0) {
            const ws3 = XLSX.utils.json_to_sheet(employeeData);
            XLSX.utils.book_append_sheet(wb, ws3, "Resumen por Empleado");
        }
        
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
            case 'aprobada':  statusText = 'Aprobada';  break;
            case 'pagada':    statusText = 'Pagada';    break;
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
        if (employee && (record.status === 'aprobada' || record.status === 'pagada')) {
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
        "Porcentaje": Object.values(departmentSummary).reduce((sum, d) => sum + d.amount, 0) > 0 ? 
            ((data.amount / Object.values(departmentSummary).reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(2) + "%" : "0%"
    }));
}

// Preparar datos de resumen por empleado para Excel
function prepareEmployeeDataForExcel() {
    // Calcular importe por empleado
    const employeeSummary = {};
    
    overtimeRecords.forEach(record => {
        if (record.status === 'aprobada' || record.status === 'pagada') {
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
        if (employee && (record.status === 'aprobada' || record.status === 'pagada')) {
            if (!departmentHours[employee.department]) {
                departmentHours[employee.department] = 0;
            }
            departmentHours[employee.department] += record.hours;
        }
    });
    
    const departments = Object.keys(departmentHours);
    const hours = Object.values(departmentHours);
    
    if (departments.length === 0) {
        // Mostrar gráfico vacío con mensaje
        const container = document.getElementById('departmentChart').parentElement;
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light); font-style: italic;">
                <i class="fas fa-chart-pie" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No hay datos suficientes para mostrar el gráfico de departamentos.
                <br>Registre horas extras aprobadas para ver la distribución.
            </div>
        `;
        return;
    }
    
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
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Horas Extras por Departamento',
                    color: document.body.classList.contains('dark-mode') ? '#E0E0E0' : '#333',
                    font: {
                        size: 16,
                        weight: 'bold'
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
    const amounts = [2250, 3100, 3900, 4750, 5500, 7375];
    
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
        if (record.status === 'aprobada' || record.status === 'pagada') {
            if (!employeeSummary[record.employeeName]) {
                employeeSummary[record.employeeName] = { hours: 0, amount: 0 };
            }
            employeeSummary[record.employeeName].hours += record.hours;
            employeeSummary[record.employeeName].amount += record.amount;
        }
    });

    if (Object.keys(employeeSummary).length === 0) {
        // Mostrar gráfico vacío con mensaje
        const container = document.getElementById('topEmployeesChart').parentElement;
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light); font-style: italic;">
                <i class="fas fa-chart-bar" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No hay datos suficientes para mostrar el ranking de empleados.
                <br>Registre horas extras aprobadas para ver el top 5.
            </div>
        `;
        return;
    }
    
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