// =========================================
// Dashboard de Finanças Pessoais — Razão
// Lógica principal da aplicação
// =========================================

// Chaves e dados iniciais ficam centralizados para facilitar manutenção.
const STORAGE_KEY = 'razao-transactions-v1';
const THEME_KEY = 'razao-theme';

const initialTransactions = [
  { id: 'seed-1', desc: 'Salário — Setembro', cat: 'Salário', date: '01/09', value: 2150, type: 'entrada' },
  { id: 'seed-2', desc: 'Aluguel', cat: 'Moradia', date: '31/08', value: -620, type: 'saida' },
  { id: 'seed-3', desc: 'Supermercado Extra', cat: 'Alimentação', date: '30/08', value: -184.60, type: 'saida' },
  { id: 'seed-4', desc: 'Uber', cat: 'Transporte', date: '29/08', value: -32, type: 'saida' },
  { id: 'seed-5', desc: 'iFood', cat: 'Alimentação', date: '28/08', value: -68.90, type: 'saida' },
  { id: 'seed-6', desc: 'Cinema', cat: 'Lazer', date: '27/08', value: -55, type: 'saida' },
  { id: 'seed-7', desc: 'Freelance design', cat: 'Outros', date: '26/08', value: 380, type: 'entrada' },
];

// Estado central da interface: transações e filtro selecionado.
const state = {
  transactions: loadTransactions(),
  filter: 'todas',
};

// Referências aos elementos da página são guardadas uma vez, evitando buscas repetidas no DOM.
const elements = {
  topDate: document.getElementById('topDate'),
  balance: document.getElementById('balanceNumber'),
  income: document.getElementById('incomeTotal'),
  expense: document.getElementById('expenseTotal'),
  categories: document.getElementById('categories'),
  ledgerBody: document.getElementById('ledgerBody'),
  ledgerEmpty: document.getElementById('ledgerEmpty'),
  overlay: document.getElementById('modalOverlay'),
  openModal: document.getElementById('openModalBtn'),
  closeModal: document.getElementById('closeModalBtn'),
  form: document.getElementById('transactionForm'),
  description: document.getElementById('descInput'),
  value: document.getElementById('valueInput'),
  category: document.getElementById('catInput'),
  descriptionError: document.getElementById('descError'),
  valueError: document.getElementById('valueError'),
  themeToggle: document.getElementById('themeToggle'),
  canvas: document.getElementById('weekChart'),
};

// Formata valores como moeda brasileira, mantendo a apresentação consistente.
function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Converte uma data para o formato curto usado nas linhas do extrato.
function formatShortDate(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

// Carrega as transações salvas. Se não houver dados válidos, usa os exemplos iniciais.
function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [...initialTransactions];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...initialTransactions];

    // Valida a estrutura mínima para evitar que dados inválidos quebrem a interface.
    return parsed.filter((tx) =>
      tx &&
      typeof tx.id === 'string' &&
      typeof tx.desc === 'string' &&
      typeof tx.cat === 'string' &&
      Number.isFinite(tx.value) &&
      (tx.type === 'entrada' || tx.type === 'saida')
    );
  } catch (error) {
    console.warn('Não foi possível carregar as transações salvas.', error);
    return [...initialTransactions];
  }
}

// Persiste as transações no navegador; isso não substitui um banco de dados remoto.
function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
  } catch (error) {
    console.warn('Não foi possível salvar as transações neste navegador.', error);
  }
}

// Atualiza a data do cabeçalho usando a data real do dispositivo.
function renderCurrentDate() {
  const today = new Date();
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(today);

  elements.topDate.textContent = formatted.charAt(0).toLocaleUpperCase('pt-BR') + formatted.slice(1);
}

// Calcula os totais a partir do estado, em vez de depender de números fixos no HTML.
function calculateSummary() {
  return state.transactions.reduce((summary, transaction) => {
    if (transaction.type === 'entrada') {
      summary.income += Math.abs(transaction.value);
    } else {
      summary.expense += Math.abs(transaction.value);
    }

    summary.balance += transaction.value;
    return summary;
  }, { income: 0, expense: 0, balance: 0 });
}

// Atualiza saldo, total de entradas e total de saídas.
function renderSummary() {
  const summary = calculateSummary();
  elements.balance.textContent = formatCurrency(summary.balance);
  elements.income.textContent = `Entradas: ${formatCurrency(summary.income)}`;
  elements.expense.textContent = `Saídas: ${formatCurrency(summary.expense)}`;
}

// Agrupa as saídas por categoria e atualiza os cartões de gastos.
function renderCategories() {
  const expensesByCategory = state.transactions
    .filter((transaction) => transaction.type === 'saida')
    .reduce((totals, transaction) => {
      totals[transaction.cat] = (totals[transaction.cat] || 0) + Math.abs(transaction.value);
      return totals;
    }, {});

  const categories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);

  const maxValue = Math.max(...categories.map(([, value]) => value), 0);
  elements.categories.replaceChildren();

  if (categories.length === 0) {
    const message = document.createElement('p');
    message.className = 'ledger-empty';
    message.textContent = 'Adicione uma saída para visualizar os gastos por categoria.';
    elements.categories.appendChild(message);
    return;
  }

  categories.forEach(([category, amount]) => {
    const card = document.createElement('article');
    card.className = 'cat-card';

    const head = document.createElement('div');
    head.className = 'cat-head';

    const name = document.createElement('span');
    name.className = 'cat-name';
    name.textContent = category;

    const value = document.createElement('span');
    value.className = 'cat-value';
    value.textContent = formatCurrency(amount);

    head.append(name, value);

    const bar = document.createElement('div');
    bar.className = 'cat-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', `Gastos em ${category}`);
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    const percentage = maxValue > 0 ? Math.round((amount / maxValue) * 100) : 0;
    bar.setAttribute('aria-valuenow', String(percentage));

    const fill = document.createElement('span');
    fill.style.width = `${percentage}%`;
    bar.appendChild(fill);

    const note = document.createElement('span');
    note.className = 'cat-note';
    note.textContent = `${percentage}% do maior gasto por categoria`;

    card.append(head, bar, note);
    elements.categories.appendChild(card);
  });
}

// Cria uma célula de texto com textContent para não interpretar descrições como HTML.
function createCell(className, text) {
  const cell = document.createElement('span');
  cell.className = className;
  cell.textContent = text;
  return cell;
}

// Renderiza o extrato conforme o filtro ativo, criando elementos sem injetar HTML do usuário.
function renderLedger() {
  const filteredTransactions = state.transactions.filter((transaction) =>
    state.filter === 'todas' || transaction.type === state.filter
  );

  elements.ledgerBody.replaceChildren();
  elements.ledgerEmpty.hidden = filteredTransactions.length > 0;

  filteredTransactions.forEach((transaction) => {
    const row = document.createElement('div');
    row.className = 'ledger-row';
    row.setAttribute('role', 'row');

    const isIncome = transaction.type === 'entrada';
    const amount = Math.abs(transaction.value);
    const valueCell = createCell(
      `tx-value ${isIncome ? 'income' : 'expense'}`,
      `${isIncome ? '+ ' : '− '}${formatCurrency(amount)}`
    );

    row.append(
      createCell('tx-desc', transaction.desc),
      createCell('tx-cat', transaction.cat),
      createCell('tx-date', transaction.date),
      valueCell
    );

    elements.ledgerBody.appendChild(row);
  });
}

// Atualiza todos os componentes que dependem das transações.
function renderDashboard() {
  renderSummary();
  renderCategories();
  renderLedger();
  drawChart();
}

// Abre o formulário e coloca o cursor no campo de descrição.
function openModal() {
  elements.overlay.hidden = false;
  elements.description.focus();
}

// Fecha o formulário, limpa mensagens antigas e restaura o tipo padrão.
function closeModal() {
  elements.overlay.hidden = true;
  elements.form.reset();
  elements.descriptionError.textContent = '';
  elements.valueError.textContent = '';
  setTransactionType('entrada');
  elements.openModal.focus();
}

// Define entrada ou saída e sincroniza o estado visual e os atributos de acessibilidade.
function setTransactionType(type) {
  selectedType = type;

  document.querySelectorAll('.type-toggle').forEach((button) => {
    const isSelected = button.dataset.type === type;
    button.classList.toggle('is-active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

// Valida os campos e retorna mensagens para os erros mais comuns.
function validateTransactionForm() {
  let valid = true;
  const description = elements.description.value.trim();
  const amount = Number(elements.value.value);

  if (description.length < 3) {
    elements.descriptionError.textContent = 'Informe uma descrição com pelo menos 3 caracteres.';
    valid = false;
  } else {
    elements.descriptionError.textContent = '';
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    elements.valueError.textContent = 'Informe um valor maior que zero.';
    valid = false;
  } else {
    elements.valueError.textContent = '';
  }

  return valid;
}

// Lê os dados do formulário, cria a transação e atualiza a interface e o armazenamento local.
function handleTransactionSubmit(event) {
  event.preventDefault();
  if (!validateTransactionForm()) return;

  const amount = Number(elements.value.value);
  const transaction = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    desc: elements.description.value.trim(),
    cat: elements.category.value,
    date: formatShortDate(),
    value: selectedType === 'saida' ? -amount : amount,
    type: selectedType,
  };

  state.transactions.unshift(transaction);
  saveTransactions();
  renderDashboard();
  closeModal();
}

// Atualiza o filtro ativo e redesenha o extrato.
function setFilter(filter) {
  state.filter = filter;

  document.querySelectorAll('.chip').forEach((button) => {
    const isSelected = button.dataset.filter === filter;
    button.classList.toggle('is-active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });

  renderLedger();
}

// Aplica o tema escolhido e mantém a preferência entre visitas ao site.
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  elements.themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

// Alterna o tema atual e tenta guardar a escolha no armazenamento local.
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);

  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    console.warn('Não foi possível salvar a preferência de tema.', error);
  }

  drawChart();
}

// Desenha um gráfico demonstrativo no Canvas. Os valores são ilustrativos, não um relatório contábil.
function drawChart() {
  const canvas = elements.canvas;
  const context = canvas.getContext('2d');
  if (!context) return;

  const styles = getComputedStyle(document.documentElement);
  const forest = styles.getPropertyValue('--forest').trim();
  const inkSoft = styles.getPropertyValue('--ink-soft').trim();

  const width = canvas.width;
  const height = canvas.height;
  const values = [120, 340, 90, 410, 260, 500, 180];
  const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  context.clearRect(0, 0, width, height);
  const maxValue = Math.max(...values, 1);
  const slotWidth = width / values.length;
  const barWidth = slotWidth * 0.5;

  values.forEach((value, index) => {
    const barHeight = (value / maxValue) * (height - 30);
    const x = index * slotWidth + (slotWidth - barWidth) / 2;
    const y = height - barHeight - 20;

    context.fillStyle = forest;
    context.globalAlpha = index === values.length - 1 ? 1 : 0.55;
    context.beginPath();

    // roundRect não está disponível em alguns navegadores antigos; usa retângulo como alternativa.
    if (typeof context.roundRect === 'function') {
      context.roundRect(x, y, barWidth, barHeight, 4);
    } else {
      context.rect(x, y, barWidth, barHeight);
    }

    context.fill();
    context.globalAlpha = 1;
    context.fillStyle = inkSoft;
    context.font = '11px "IBM Plex Sans", sans-serif';
    context.textAlign = 'center';
    context.fillText(labels[index], x + barWidth / 2, height - 4);
  });
}

// Conecta os eventos da interface aos comportamentos da aplicação.
function bindEvents() {
  elements.openModal.addEventListener('click', openModal);
  elements.closeModal.addEventListener('click', closeModal);

  elements.overlay.addEventListener('click', (event) => {
    if (event.target === elements.overlay) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.overlay.hidden) closeModal();
  });

  document.querySelectorAll('.type-toggle').forEach((button) => {
    button.addEventListener('click', () => setTransactionType(button.dataset.type));
  });

  elements.form.addEventListener('submit', handleTransactionSubmit);

  document.querySelectorAll('.chip').forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  elements.themeToggle.addEventListener('click', toggleTheme);

  // A navegação só destaca o item escolhido; as telas de Metas e Ajustes ainda não existem.
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });

      button.classList.add('is-active');
      button.setAttribute('aria-current', 'page');

      if (button.dataset.nav === 'transacoes') {
        document.querySelector('.ledger').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (button.dataset.nav !== 'dashboard') {
        // Evita prometer uma tela que ainda não foi implementada.
        button.classList.remove('is-active');
        document.querySelector('[data-nav="dashboard"]').classList.add('is-active');
        document.querySelector('[data-nav="dashboard"]').setAttribute('aria-current', 'page');
        window.alert('Esta seção ainda não está disponível nesta versão do projeto.');
      } else {
        document.querySelector('.top').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('resize', drawChart);
}

// Define o tipo inicial do formulário e inicia a aplicação.
let selectedType = 'entrada';

function init() {
  renderCurrentDate();

  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  } catch (error) {
    console.warn('Não foi possível ler a preferência de tema.', error);
  }

  applyTheme(savedTheme);
  bindEvents();
  renderDashboard();
}

init();
