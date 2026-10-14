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
            <td>${escapeHtml(employee.name)}</td>
            <td>${escapeHtml(employee.department)}</td>
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

// Configurar búsqueda de empleados
function setupSearch() {
    document.getElementById('employee-search').addEventListener('input', function() {
        employeeSearchTerm = this.value.toLowerCase();
        employeesCurrentPage = 1;
        loadEmployeesTable();
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
            const date = new Date(r.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const reason = escapeHtml(r.reason);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>${r.hours} h</td>
                <td>${formatRecordAmount(r)}</td>
                <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${reason}">${reason}</td>
                <td>${statusBadgeHtml(r.status)}</td>
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
