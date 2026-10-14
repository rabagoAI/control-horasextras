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
        <h4>${escapeHtml(task.title)}</h4>
        <p>${escapeHtml(task.description)}</p>
        <div class="kanban-card-footer">
            <span>${escapeHtml(task.assignee || 'Sin asignar')}</span>
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
