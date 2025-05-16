// Certifique-se de que este arquivo se chama script.js e está na mesma pasta do index.html
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Iniciando script.js");

    // --- Seletores do DOM ---
    const newTaskInput = document.getElementById('new-task-input');
    const newTaskDetailsInput = document.getElementById('new-task-details');
    // const newTaskDueDateInput = document.getElementById('new-task-dueDate-input'); // REMOVIDO
    const newTaskPrioritySelect = document.getElementById('new-task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterPrioritySelect = document.getElementById('filter-priority');
    const sortTasksBtn = document.getElementById('sort-tasks-btn');

    // >> Seletores para o Modal de Alerta <<
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertOverlay = document.getElementById('custom-alert-overlay');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // >> Seletores para o Modal de Confirmação de Exclusão <<
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteConfirmOverlay = document.getElementById('delete-confirm-overlay');
    const deleteConfirmMessage = document.getElementById('delete-confirm-message');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');

    // >> Seletores para o Modal de Edição de Tarefa <<
    const editTaskModal = document.getElementById('edit-task-modal');
    const editTaskOverlay = document.getElementById('edit-task-overlay');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskTitleInput = document.getElementById('edit-task-title-input');
    const editTaskDetailsInput = document.getElementById('edit-task-details-input');
    const editTaskPrioritySelect = document.getElementById('edit-task-priority-select');
    const editTaskSaveBtn = document.getElementById('edit-task-save-btn');
    const editTaskCancelBtn = document.getElementById('edit-task-cancel-btn');


    // Verifica se os seletores encontraram os elementos
    if (!newTaskInput) console.error("ERRO: Elemento #new-task-input não encontrado!");
    if (!newTaskDetailsInput) console.warn("AVISO: Elemento #new-task-details não encontrado!");
    // O seletor para newTaskDueDateInput foi removido
    if (!newTaskPrioritySelect) console.error("ERRO: Elemento #new-task-priority não encontrado!");
    if (!addTaskBtn) console.error("ERRO: Elemento #add-task-btn não encontrado!");
    if (!taskList) console.error("ERRO: Elemento #task-list não encontrado!");
    if (!filterPrioritySelect) console.error("ERRO: Elemento #filter-priority não encontrado!");
    if (!sortTasksBtn) console.error("ERRO: Elemento #sort-tasks-btn não encontrado!");

    if (!customAlertModal) console.error("ERRO: Elemento #custom-alert-modal não encontrado!");
    if (!customAlertOverlay) console.error("ERRO: Elemento #custom-alert-overlay não encontrado!");
    if (!modalMessage) console.error("ERRO: Elemento #modal-message não encontrado!");
    if (!modalCloseBtn) console.error("ERRO: Elemento #modal-close-btn não encontrado!");

    if (!deleteConfirmModal) console.error("ERRO: Elemento #delete-confirm-modal não encontrado!");
    if (!deleteConfirmOverlay) console.error("ERRO: Elemento #delete-confirm-overlay não encontrado!");
    if (!deleteConfirmMessage) console.error("ERRO: Elemento #delete-confirm-message não encontrado!");
    if (!deleteConfirmBtn) console.error("ERRO: Elemento #delete-confirm-btn não encontrado!");
    if (!deleteCancelBtn) console.error("ERRO: Elemento #delete-cancel-btn não encontrado!");

    if (!editTaskModal) console.error("ERRO: Elemento #edit-task-modal não encontrado!");
    if (!editTaskOverlay) console.error("ERRO: Elemento #edit-task-overlay não encontrado!");
    if (!editTaskForm) console.error("ERRO: Elemento #edit-task-form não encontrado!");
    if (!editTaskTitleInput) console.error("ERRO: Elemento #edit-task-title-input não encontrado!");
    if (!editTaskDetailsInput) console.error("ERRO: Elemento #edit-task-details-input não encontrado!");
    if (!editTaskPrioritySelect) console.error("ERRO: Elemento #edit-task-priority-select não encontrado!");
    if (!editTaskSaveBtn) console.error("ERRO: Elemento #edit-task-save-btn não encontrado!");
    if (!editTaskCancelBtn) console.error("ERRO: Elemento #edit-task-cancel-btn não encontrado!");


    // --- Estado da Aplicação ---
    let tasks = [];
    let isSortAscending = false;
    let taskToDeleteId = null;
    let taskToDeleteElement = null;
    let taskToEditId = null;

    const priorityOrder = {
        'low': 1,
        'medium': 2,
        'high': 3
    };


    // --- Funções ---

    function showModal(modalElement, overlayElement) {
        if (!modalElement || !overlayElement) return;
        overlayElement.style.display = 'block';
        modalElement.style.display = 'block';
        requestAnimationFrame(() => {
            overlayElement.classList.add('visible');
            modalElement.classList.add('visible');
        });
    }

    function hideModal(modalElement, overlayElement) {
        if (!modalElement || !overlayElement) return;
        overlayElement.classList.remove('visible');
        modalElement.classList.remove('visible');
        setTimeout(() => {
            overlayElement.style.display = 'none';
            modalElement.style.display = 'none';
        }, 300);
    }

    function showCustomAlert(message) {
        if (!modalMessage) return;
        modalMessage.textContent = message;
        showModal(customAlertModal, customAlertOverlay);
        if (modalCloseBtn) modalCloseBtn.focus();
    }

    function hideCustomAlert() {
        hideModal(customAlertModal, customAlertOverlay);
    }

    function showDeleteConfirmModal(taskId, taskCardElement) {
        taskToDeleteId = taskId;
        taskToDeleteElement = taskCardElement;
        showModal(deleteConfirmModal, deleteConfirmOverlay);
        if (deleteConfirmBtn) deleteConfirmBtn.focus();
    }

    function hideDeleteConfirmModal() {
        hideModal(deleteConfirmModal, deleteConfirmOverlay);
        taskToDeleteId = null;
        taskToDeleteElement = null;
    }

    function showEditTaskModal(task) {
        if (!editTaskModal || !editTaskOverlay || !editTaskForm || !task) return;

        taskToEditId = task.id;
        editTaskTitleInput.value = task.title || '';
        editTaskDetailsInput.value = task.details || '';
        // dueDate removido do modal de edição
        editTaskPrioritySelect.value = task.priority || 'low';

        showModal(editTaskModal, editTaskOverlay);
        editTaskTitleInput.focus();
    }

    function hideEditTaskModal() {
        hideModal(editTaskModal, editTaskOverlay);
        if (editTaskForm) editTaskForm.reset();
        taskToEditId = null;
    }


    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error("Erro ao salvar tarefas no localStorage:", error);
        }
    }

    function loadTasks() {
        console.log("loadTasks: Carregando tarefas...");
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            try {
                tasks = JSON.parse(storedTasks);
                // Certificar que tarefas antigas não tenham 'dueDate' se não quisermos mais
                tasks = tasks.map(task => {
                    const { dueDate, ...restOfTask } = task; // Remove dueDate se existir
                    return restOfTask;
                });
            } catch (error) {
                console.error("Erro ao parsear tarefas do localStorage:", error);
                tasks = [];
            }
        } else {
            console.log("Nenhuma tarefa encontrada no localStorage. Iniciando vazio.");
            tasks = [];
        }
        renderAllTasks();
        updateSortButtonState();
    }

    // parseDate e formatDateDisplay não são mais necessárias, pois removemos dueDate
    // function parseDate(dateString) { ... } // REMOVIDO
    // function formatDateDisplay(dateObj) { ... } // REMOVIDO

    function renderTask(task) {
        if (!taskList) return;

        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        const priority = task.priority || 'low';
        taskCard.classList.add(`priority-${priority}`);
        taskCard.dataset.taskId = task.id;

        if (task.completed) {
            taskCard.classList.add('completed');
        }

        // dueDate removido da renderização
        taskCard.innerHTML = `
            <div class="task-main-info">
                 <div class="task-content">
                    <input type="checkbox" class="task-checkbox" id="task-${task.id}" aria-labelledby="task-title-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="task-${task.id}" id="task-title-${task.id}" class="task-title">${task.title || 'Tarefa sem título'}</label>
                </div>
                <div class="task-meta">
                    <span class="task-priority ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                </div>
            </div>
            <div class="task-card-actions">
                <button class="details-btn" title="Ver Detalhes" aria-label="Ver Detalhes da Tarefa ${task.id}"><i class="fas fa-info-circle"></i></button>
                <button class="edit-btn" title="Editar Tarefa" aria-label="Editar Tarefa ${task.id}"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-btn" title="Excluir Tarefa" aria-label="Excluir Tarefa ${task.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="task-details" style="display: none;">
                <p><strong>Detalhes:</strong> ${task.details || 'Nenhum detalhe adicionado.'}</p>
                 <p><strong>Prioridade:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
            </div>
        `;
        taskList.appendChild(taskCard);
    }

    function renderAllTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        tasks.forEach(task => renderTask(task));
        filterTasks();
    }

    function addTask() {
        // newTaskDueDateInput removido das verificações e uso
        if (!newTaskInput || !newTaskDetailsInput || !newTaskPrioritySelect) {
            console.error("addTask: Um ou mais elementos de input da header não foram encontrados.");
            return;
        }

        const taskTitle = newTaskInput.value.trim();
        const taskDetails = newTaskDetailsInput.value.trim();
        const taskPriority = newTaskPrioritySelect.value;
        // const taskDueDateStr = newTaskDueDateInput.value.trim(); // REMOVIDO
        // let taskDueDateValue = null; // REMOVIDO

        if (taskTitle === '') {
            showCustomAlert('Por favor, digite o título da tarefa.');
            newTaskInput.focus();
            return;
        }

        // Validação de dueDate removida
        // if (taskDueDateStr !== '') { ... } // REMOVIDO

        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            completed: false,
            priority: taskPriority,
            // dueDate: taskDueDateValue, // REMOVIDO
            details: taskDetails
        };

        tasks.unshift(newTask);
        saveTasks();
        renderAllTasks();
        newTaskInput.value = '';
        newTaskDetailsInput.value = '';
        // newTaskDueDateInput.value = ''; // REMOVIDO
        newTaskPrioritySelect.value = 'low';
        newTaskInput.focus();
    }

    function toggleComplete(taskId, checkbox) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = checkbox.checked;
            saveTasks();
            const taskCard = checkbox.closest('.task-card');
            if (taskCard) {
                taskCard.classList.toggle('completed', checkbox.checked);
            }
        } else {
            console.warn(`toggleComplete: Tarefa com ID ${taskId} não encontrada.`);
        }
    }

    function deleteTask(taskId, taskCardElement) {
        showDeleteConfirmModal(taskId, taskCardElement);
    }

    function confirmActualDelete() {
        if (taskToDeleteId && taskToDeleteElement) {
            tasks = tasks.filter(t => t.id !== taskToDeleteId);
            saveTasks();
            taskToDeleteElement.remove();
        } else {
            console.warn("confirmActualDelete: ID da tarefa ou elemento não definido.");
        }
        hideDeleteConfirmModal();
    }

    function toggleDetails(detailsElement) {
        if (!detailsElement) return;
        const isVisible = detailsElement.style.display === 'block';
        detailsElement.style.display = isVisible ? 'none' : 'block';
    }

    function handleEditTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            showEditTaskModal(task);
        } else {
            console.warn(`handleEditTask: Tarefa com ID ${taskId} não encontrada.`);
            showCustomAlert("Não foi possível encontrar a tarefa para edição.");
        }
    }

    function filterTasks() {
        const selectedPriority = filterPrioritySelect ? filterPrioritySelect.value : 'all';
        if (!taskList) return;
        const allTaskCards = taskList.querySelectorAll('.task-card');

        allTaskCards.forEach(card => {
            const taskId = card.dataset.taskId;
            const taskData = tasks.find(t => t.id === taskId);
            let matchesPriority = false;

            if (taskData) {
                 const taskActualPriority = taskData.priority || 'low';
                 matchesPriority = (selectedPriority === 'all' || taskActualPriority === selectedPriority);
            } else {
                 console.warn(`Filter: No task data found for card with ID ${taskId}`);
            }
            card.style.display = matchesPriority ? '' : 'none';
        });
    }

    function sortTasksByPriority() {
        tasks.sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 0;
            const priorityB = priorityOrder[b.priority] || 0;

            let comparison = 0;
            if (priorityA < priorityB) {
                comparison = -1;
            } else if (priorityA > priorityB) {
                comparison = 1;
            }
            return isSortAscending ? comparison : comparison * -1;
        });
        isSortAscending = !isSortAscending;
        updateSortButtonState();
        saveTasks();
        renderAllTasks();
    }

    function updateSortButtonState() {
         if (!sortTasksBtn) return;
         const icon = sortTasksBtn.querySelector('i');
         const btnTextSpan = sortTasksBtn.querySelector('.btn-text');

         if(btnTextSpan) btnTextSpan.textContent = "Prioridade";

         if (icon) {
             if (isSortAscending) {
                 icon.classList.remove('fa-sort-amount-up');
                 icon.classList.add('fa-sort-amount-down');
                 sortTasksBtn.title = "Ordenar por Prioridade (Baixa Primeiro)";
             } else {
                 icon.classList.remove('fa-sort-amount-down');
                 icon.classList.add('fa-sort-amount-up');
                 sortTasksBtn.title = "Ordenar por Prioridade (Alta Primeiro)";
             }
         }
     }

    // --- Event Listeners ---

    // newTaskDueDateInput removido dos event listeners
    if (addTaskBtn && newTaskInput && newTaskDetailsInput && newTaskPrioritySelect) {
        addTaskBtn.addEventListener('click', addTask);
        // newTaskDueDateInput removido do array para event listener de 'keypress'
        [newTaskInput, newTaskDetailsInput].forEach(element => {
            if (element) {
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && e.target !== newTaskPrioritySelect) {
                        e.preventDefault();
                        addTask();
                    }
                });
            }
        });
    }

    // Event listener para newTaskDueDateInput removido
    // if (newTaskDueDateInput) { ... } // REMOVIDO


    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const card = e.target.closest('.task-card');
            if (!card) return;
            const taskId = card.dataset.taskId;

            if (e.target.classList.contains('task-checkbox')) {
                toggleComplete(taskId, e.target);
            }
            else if (e.target.closest('.delete-btn')) {
                deleteTask(taskId, card);
            }
            else if (e.target.closest('.edit-btn')) {
                 handleEditTask(taskId);
            }
            else if (e.target.closest('.details-btn')) {
                const detailsElement = card.querySelector('.task-details');
                if (detailsElement) toggleDetails(detailsElement);
            }
             else if (e.target.classList.contains('task-title')) {
                 const checkbox = card.querySelector('.task-checkbox');
                 if (checkbox) {
                     checkbox.checked = !checkbox.checked;
                     toggleComplete(taskId, checkbox);
                 }
             }
        });
    }

    if (filterPrioritySelect) {
        filterPrioritySelect.addEventListener('change', filterTasks);
    }

    if (sortTasksBtn) {
         sortTasksBtn.addEventListener('click', sortTasksByPriority);
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideCustomAlert);
    if (customAlertOverlay) customAlertOverlay.addEventListener('click', hideCustomAlert);

    if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmActualDelete);
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', hideDeleteConfirmModal);
    if (deleteConfirmOverlay) deleteConfirmOverlay.addEventListener('click', hideDeleteConfirmModal);

    if (editTaskForm) {
        editTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!taskToEditId) return;

            const taskIndex = tasks.findIndex(t => t.id === taskToEditId);
            if (taskIndex > -1) {
                const newTitle = editTaskTitleInput.value.trim();
                if (newTitle === '') {
                    showCustomAlert('O título da tarefa não pode ser vazio.');
                    editTaskTitleInput.focus();
                    return;
                }
                tasks[taskIndex].title = newTitle;
                tasks[taskIndex].details = editTaskDetailsInput.value.trim();
                tasks[taskIndex].priority = editTaskPrioritySelect.value;
                // dueDate já foi removido da lógica de edição

                saveTasks();
                renderAllTasks();
                hideEditTaskModal();
            } else {
                showCustomAlert("Erro: Tarefa para edição não encontrada.");
                hideEditTaskModal();
            }
        });
    }
    if (editTaskCancelBtn) editTaskCancelBtn.addEventListener('click', hideEditTaskModal);
    if (editTaskOverlay) editTaskOverlay.addEventListener('click', hideEditTaskModal);


    window.addEventListener('keydown', (e) => {
         if (e.key === 'Escape') {
            if (customAlertModal && customAlertModal.classList.contains('visible')) {
                hideCustomAlert();
            }
            if (deleteConfirmModal && deleteConfirmModal.classList.contains('visible')) {
                hideDeleteConfirmModal();
            }
            if (editTaskModal && editTaskModal.classList.contains('visible')) {
                hideEditTaskModal();
            }
         }
    });

    loadTasks();

});