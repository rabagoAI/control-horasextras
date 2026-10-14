// Recalcula overtime/overtimeAmount/lastOvertime de un empleado a partir de sus registros reales.
// Única fuente de verdad para estos totales: evita mantener sumas/restas manuales duplicadas en
// cada punto de alta, edición o baja de un registro (y el desfase que eso puede producir con el tiempo).
function recalculateEmployeeStats(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    const recognized = overtimeRecords.filter(r => r.employeeId === employeeId && isRecognized(r));
    employee.overtime = recognized.reduce((sum, r) => sum + r.hours, 0);
    employee.overtimeAmount = recognized.reduce((sum, r) => sum + recordAmount(r), 0);
    employee.lastOvertime = recognized.length > 0
        ? recognized.reduce((latest, r) => (r.date > latest ? r.date : latest), recognized[0].date)
        : null;
}

// Primer y último día (YYYY-MM-DD) del mes actual, usados como rango por defecto
function getCurrentMonthRange() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const pad = n => String(n).padStart(2, '0');
    const from = `${y}-${pad(m + 1)}-01`;
    const to = `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
    return { from, to };
}

// Registros de horas extras según los filtros de la tabla (empleado, estado, fechas):
// única fuente de verdad, usada tanto por la tabla como por las tarjetas del Dashboard
function getFilteredOvertimeRecords() {
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
    return filteredRecords;
}

// Cargar datos del dashboard (tarjetas KPI), sincronizadas con los filtros de la tabla de abajo
function loadDashboardData() {
    const totalEmployees = employees.length;
    const filteredRecords = getFilteredOvertimeRecords();

    // Si el usuario no ha elegido un estado concreto, "Horas Extras" solo cuenta
    // lo ya reconocido (aprobada/pagada/disfrutada); si ha filtrado por un estado, se respeta ese filtro tal cual
    // (filteredRecords ya viene acotado a ese estado desde getFilteredOvertimeRecords).
    const totalOvertime = filteredRecords
        .filter(record => overtimeFilterStatus || isRecognized(record))
        .reduce((sum, record) => sum + record.hours, 0);

    // "Total a Pagar": sin filtro de estado, solo lo aprobado aún no pagado; con filtro, respeta ese filtro.
    const totalPay = filteredRecords
        .filter(record => overtimeFilterStatus || record.status === 'aprobada')
        .reduce((sum, record) => sum + recordAmount(record), 0);

    // "Pendientes de Aprobación" es intencionalmente global (no usa los filtros de la tabla):
    // son acciones que requieren atención, no un total del periodo/vista actual.
    const pendingApprovals = overtimeRecords.filter(record => record.status === 'pendiente').length;

    // Actualizar valores en el DOM
    document.getElementById('total-employees').textContent = totalEmployees;
    document.getElementById('total-overtime').textContent = totalOvertime.toFixed(1);
    document.getElementById('pending-approvals').textContent = pendingApprovals;
    document.getElementById('total-pay').textContent = totalPay.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Cargar tabla de horas extras recientes y el gráfico de departamentos (mismos filtros)
    loadOvertimeTable();
    if (document.getElementById('departmentChart')) {
        createDepartmentChart();
    }
}

// Cargar tabla de horas extras
function loadOvertimeTable() {
    const tableBody = document.getElementById('overtime-table');
    tableBody.innerHTML = '';

    let filteredRecords = getFilteredOvertimeRecords();

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

        row.innerHTML = `
            <td><input type="checkbox" class="overtime-checkbox" data-id="${record.id}"></td>
            <td>${escapeHtml(record.employeeName)}</td>
            <td>${formattedDate}</td>
            <td>${record.hours}</td>
            <td>€${record.rate.toFixed(2)}</td>
            <td>${formatRecordAmount(record)}</td>
            <td>${escapeHtml(record.reason)}</td>
            <td>${statusBadgeHtml(record.status)}</td>
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
        loadDashboardData();
    });

    statusFilter.addEventListener('change', function() {
        overtimeFilterStatus = this.value;
        overtimeCurrentPage = 1;
        loadDashboardData();
    });

    selectAll.addEventListener('change', function() {
        document.querySelectorAll('.overtime-checkbox').forEach(cb => cb.checked = this.checked);
        updateBulkDeleteToolbar();
    });

    deleteSelectedBtn.addEventListener('click', deleteSelectedOvertimes);

    document.getElementById('overtime-date-from').addEventListener('change', function() {
        overtimeFilterDateFrom = this.value;
        overtimeCurrentPage = 1;
        loadDashboardData();
    });

    document.getElementById('overtime-date-to').addEventListener('change', function() {
        overtimeFilterDateTo = this.value;
        overtimeCurrentPage = 1;
        loadDashboardData();
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
            const affectedEmployeeIds = new Set(
                overtimeRecords.filter(r => ids.has(r.id)).map(r => r.employeeId)
            );
            overtimeRecords = overtimeRecords.filter(r => !ids.has(r.id));
            affectedEmployeeIds.forEach(recalculateEmployeeStats);
            saveData();
            showNotification(`${count} registro${count !== 1 ? 's eliminados' : ' eliminado'} correctamente`, 'success');
            loadDashboardData();
            loadEmployeesTable();
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
            const oldEmployeeId = overtimeRecords[index].employeeId;
            overtimeRecords[index] = overtimeData;

            // Recalcular estadísticas del empleado (y del anterior, si se reasignó el registro a otro empleado)
            recalculateEmployeeStats(employeeId);
            if (oldEmployeeId !== employeeId) recalculateEmployeeStats(oldEmployeeId);

            showNotification('Horas extras actualizadas correctamente', 'success');
        }
    } else {
        // Agregar nuevo registro
        overtimeRecords.push(overtimeData);
        recalculateEmployeeStats(employeeId);
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
    const counts = isRecognized(record);

    showConfirmModal({
        title: 'Eliminar registro',
        message: `${record.employeeName} · ${record.hours}h el ${dateStr}`,
        warning: counts ? 'Se descontarán las horas de las estadísticas del empleado.' : '',
        confirmText: 'Eliminar',
        danger: true,
        onConfirm: () => {
            const index = overtimeRecords.findIndex(r => r.id === id);
            if (index === -1) return;
            overtimeRecords.splice(index, 1);
            recalculateEmployeeStats(record.employeeId);
            saveData();
            showNotification('Registro eliminado correctamente', 'success');
            loadDashboardData();
            loadEmployeesTable();
        }
    });
}
