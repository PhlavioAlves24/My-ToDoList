// Certifique-se de que este arquivo se chama script.js e está na mesma pasta do index.html
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Iniciando script.js");

    // --- Seletores do DOM ---
    const newTaskInput = document.getElementById('new-task-input');
    const newTaskDetailsInput = document.getElementById('new-task-details');
    const newTaskPrioritySelect = document.getElementById('new-task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterPrioritySelect = document.getElementById('filter-priority');
    const sortDateBtn = document.getElementById('sort-date-btn');

    // >> Seletores para o Modal <<
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertOverlay = document.getElementById('custom-alert-overlay');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Verifica se os seletores encontraram os elementos
    if (!newTaskInput) console.error("ERRO: Elemento #new-task-input não encontrado!");
    if (!newTaskDetailsInput) console.warn("AVISO: Elemento #new-task-details não encontrado!");
    if (!newTaskPrioritySelect) console.error("ERRO: Elemento #new-task-priority não encontrado!");
    if (!addTaskBtn) console.error("ERRO: Elemento #add-task-btn não encontrado!");
    if (!taskList) console.error("ERRO: Elemento #task-list não encontrado!");
    if (!filterPrioritySelect) console.error("ERRO: Elemento #filter-priority não encontrado!");
    if (!sortDateBtn) console.error("ERRO: Elemento #sort-date-btn não encontrado!");
    if (!customAlertModal) console.error("ERRO: Elemento #custom-alert-modal não encontrado!");
    if (!customAlertOverlay) console.error("ERRO: Elemento #custom-alert-overlay não encontrado!");
    if (!modalMessage) console.error("ERRO: Elemento #modal-message não encontrado!");
    if (!modalCloseBtn) console.error("ERRO: Elemento #modal-close-btn não encontrado!");


    // --- Estado da Aplicação ---
    let tasks = [];
    let isSortAscending = true;

    // --- Funções ---

    // >> Função para mostrar o modal customizado <<
    function showModal(message) {
        if (!customAlertModal || !customAlertOverlay || !modalMessage) return;

        modalMessage.textContent = message;
        customAlertOverlay.style.display = 'block'; // Mostra antes de animar
        customAlertModal.style.display = 'block';

        requestAnimationFrame(() => { // Garante que display:block foi aplicado
             customAlertOverlay.classList.add('visible');
             customAlertModal.classList.add('visible');
        });

        modalCloseBtn.focus(); // Foca o botão
    }

    // >> Função para esconder o modal customizado <<
    function hideModal() {
        if (!customAlertModal || !customAlertOverlay) return;

        customAlertOverlay.classList.remove('visible');
        customAlertModal.classList.remove('visible');

        // Espera a transição CSS terminar (300ms) antes de ocultar com display:none
        setTimeout(() => {
            customAlertOverlay.style.display = 'none';
            customAlertModal.style.display = 'none';
        }, 300);
    }


    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            // console.log("Tarefas salvas no localStorage:", tasks);
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
                // console.log("Tarefas carregadas do localStorage:", tasks);
            } catch (error) {
                console.error("Erro ao parsear tarefas do localStorage:", error);
                tasks = [];
            }
        } else {
            console.log("Nenhuma tarefa encontrada no localStorage. Iniciando vazio.");
            tasks = [];
        }
        renderAllTasks();
        updateSortButtonIcon();
    }

    function parseDate(dateString) {
        if (!dateString || typeof dateString !== 'string') return null;
        const dateObj = new Date(dateString.split('T')[0] + 'T00:00:00Z');
        if (isNaN(dateObj.getTime())) {
            const dateObjAlt = new Date(dateString);
            if (isNaN(dateObjAlt.getTime())) {
                console.warn(`Data inválida encontrada: ${dateString}`);
                return null;
            }
            return dateObjAlt;
        }
        return dateObj;
    }

    function formatDateDisplay(dateObj) {
        if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            return '';
        }
        try {
            const day = String(dateObj.getUTCDate()).padStart(2, '0');
            const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const year = dateObj.getUTCFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Erro ao formatar data:", e, "Objeto Date:", dateObj);
            return '';
        }
    }

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

        const dateObj = parseDate(task.dueDate);
        const displayDate = formatDateDisplay(dateObj);

        taskCard.innerHTML = `
            <div class="task-main-info">
                 <div class="task-content">
                    <input type="checkbox" class="task-checkbox" id="task-${task.id}" aria-labelledby="task-title-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="task-${task.id}" id="task-title-${task.id}" class="task-title">${task.title || 'Tarefa sem título'}</label>
                </div>
                <div class="task-meta">
                    ${displayDate ? `<span class="task-due-date"><i class="far fa-calendar-alt"></i> ${displayDate}</span>` : ''}
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
                 ${displayDate ? `<p><strong>Data de Vencimento:</strong> ${displayDate}</p>` : ''}
                 <p><strong>Prioridade:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
            </div>
        `;
        taskList.appendChild(taskCard);
    }

    function renderAllTasks() {
        // console.log("renderAllTasks: Renderizando todas as tarefas...");
        if (!taskList) return;
        taskList.innerHTML = '';
        tasks.forEach(task => renderTask(task));
        filterTasks();
    }

    function addTask() {
        // console.log("addTask: Tentando adicionar tarefa...");
        if (!newTaskInput || !newTaskDetailsInput || !newTaskPrioritySelect) {
            console.error("addTask: Elementos de input não encontrados.");
            return;
        }

        const taskTitle = newTaskInput.value.trim();
        const taskDetails = newTaskDetailsInput.value.trim();
        const taskPriority = newTaskPrioritySelect.value;

        if (taskTitle === '') {
            // alert('Por favor, digite o título da tarefa.'); // Substituído
            showModal('Por favor, digite o título da tarefa.');
            newTaskInput.focus();
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            completed: false,
            priority: taskPriority,
            dueDate: null,
            details: taskDetails
        };
        // console.log("addTask: Nova tarefa criada:", newTask);

        tasks.unshift(newTask);
        saveTasks();
        renderAllTasks();
        newTaskInput.value = '';
        newTaskDetailsInput.value = '';
        newTaskPrioritySelect.value = 'low';
        newTaskInput.focus();
    }

    function toggleComplete(taskId, checkbox) {
        // console.log(`toggleComplete: Marcando tarefa ${taskId} como ${checkbox.checked}`);
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
        // console.log(`deleteTask: Tentando excluir tarefa ${taskId}`);
        // Mantendo confirm nativo para simplicidade.
        // Para um modal customizado aqui, seria necessário mais lógica (ver comentário na resposta anterior).
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            taskCardElement.remove();
            // console.log(`deleteTask: Tarefa ${taskId} excluída.`);
        }
    }

     function toggleDetails(detailsElement) {
        // console.log("toggleDetails: Mostrando/Ocultando detalhes");
        if (!detailsElement) return;
        const isVisible = detailsElement.style.display === 'block';
        detailsElement.style.display = isVisible ? 'none' : 'block';
    }

    function editTask(taskId) {
        // console.log(`editTask: Tentando editar tarefa ${taskId}`);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const task = tasks[taskIndex];

            const newTitle = prompt('Editar título da tarefa:', task.title);
            if (newTitle === null) return;
             if (newTitle.trim() === '') {
                 // alert('O título não pode ficar vazio.'); // Substituído
                 showModal('O título não pode ficar vazio.');
                 return;
             }
             task.title = newTitle.trim();

            const newDueDate = prompt(`Editar data de vencimento (formato AAAA-MM-DD) ou deixe vazio para remover:`, task.dueDate || '');
             if (newDueDate === null) return;
             if (newDueDate.trim() === '' || /^\d{4}-\d{2}-\d{2}$/.test(newDueDate.trim())) {
                 const potentialDate = newDueDate.trim() || null;
                 if (potentialDate && !parseDate(potentialDate)) {
                     // alert('A data inserida parece inválida...'); // Substituído
                     showModal('A data inserida parece inválida. Verifique o formato AAAA-MM-DD e os valores.');
                 } else {
                     task.dueDate = potentialDate;
                 }
             } else {
                 // alert('Formato de data inválido...'); // Substituído
                 showModal('Formato de data inválido. Use AAAA-MM-DD ou deixe vazio.');
             }

            const newPriority = prompt(`Editar prioridade (high, medium, low):`, task.priority)?.toLowerCase();
            if (newPriority === null) return;
            if (['high', 'medium', 'low'].includes(newPriority)) {
                 task.priority = newPriority;
             } else if (newPriority.trim() !== '') {
                 // alert('Prioridade inválida...'); // Substituído
                 showModal('Prioridade inválida. Use high, medium ou low.');
             }

             const newDetails = prompt(`Editar detalhes:`, task.details || '');
             if (newDetails === null) return;
             task.details = newDetails.trim();

            saveTasks();
            renderAllTasks(); // Re-render para mostrar mudanças
            // console.log(`editTask: Tarefa ${taskId} atualizada.`);

        } else {
             console.warn(`editTask: Tarefa com ID ${taskId} não encontrada.`);
        }
    }

    function filterTasks() {
        const selectedPriority = filterPrioritySelect ? filterPrioritySelect.value : 'all';
        // console.log(`filterTasks: Filtrando por prioridade: ${selectedPriority}`);
        if (!taskList) return;
        const allTaskCards = taskList.querySelectorAll('.task-card');

        allTaskCards.forEach(card => {
            const taskId = card.dataset.taskId;
            const taskData = tasks.find(t => t.id === taskId);
            let matchesPriority = false;
            if (taskData) {
                 matchesPriority = (selectedPriority === 'all' || taskData.priority === selectedPriority);
            } else {
                 console.warn(`Filter: No task data found for card with ID ${taskId}`);
            }
            card.style.display = matchesPriority ? 'flex' : 'none'; // Usa flex por padrão, mas verifica CSS
        });
    }

    function sortTasksByDate() {
        // console.log(`sortTasksByDate: Ordenando por data.`);
        tasks.sort((a, b) => {
            const dateA = parseDate(a.dueDate);
            const dateB = parseDate(b.dueDate);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            const comparison = dateA.getTime() - dateB.getTime();
            return isSortAscending ? comparison : comparison * -1;
        });
        isSortAscending = !isSortAscending;
        updateSortButtonIcon();
        saveTasks();
        renderAllTasks();
    }

     function updateSortButtonIcon() {
         if (!sortDateBtn) return;
         const icon = sortDateBtn.querySelector('i');
         if (icon) {
             if (isSortAscending) {
                 icon.classList.remove('fa-sort-amount-up');
                 icon.classList.add('fa-sort-amount-down');
                 sortDateBtn.title = "Ordenar por Data (Mais Antiga Primeiro)";
             } else {
                 icon.classList.remove('fa-sort-amount-down');
                 icon.classList.add('fa-sort-amount-up');
                  sortDateBtn.title = "Ordenar por Data (Mais Nova Primeiro)";
             }
         }
     }

    // --- Event Listeners ---

    if (addTaskBtn && newTaskInput && newTaskDetailsInput && newTaskPrioritySelect) {
        addTaskBtn.addEventListener('click', addTask);
        [newTaskInput, newTaskDetailsInput, newTaskPrioritySelect].forEach(element => {
            element.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                }
            });
        });
    } else {
         console.error("ERRO: Não foi possível adicionar listeners para adicionar tarefas.");
    }

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
                 editTask(taskId);
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
    } else {
        console.error("ERRO: Não foi possível adicionar listener de clique na lista de tarefas.");
    }

    if (filterPrioritySelect) {
        filterPrioritySelect.addEventListener('change', filterTasks);
    } else {
         console.error("ERRO: Não foi possível adicionar listener de filtro.");
    }

     if (sortDateBtn) {
         sortDateBtn.addEventListener('click', sortTasksByDate);
     } else {
         console.error("ERRO: Não foi possível adicionar listener de ordenação.");
     }

     // >> Listeners para o Modal <<
     if (modalCloseBtn) {
         modalCloseBtn.addEventListener('click', hideModal);
     }
     if (customAlertOverlay) {
         customAlertOverlay.addEventListener('click', hideModal); // Fecha ao clicar fora
     }
     window.addEventListener('keydown', (e) => {
         if (e.key === 'Escape' && customAlertModal.style.display === 'block') {
             hideModal();
         }
     });


    // --- Inicialização ---
    loadTasks(); // Carrega as tarefas ao iniciar

}); // Fim do DOMContentLoaded