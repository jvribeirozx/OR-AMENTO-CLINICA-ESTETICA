// Store com persistência em localStorage

const LS_KEY = 'orcamento_orders';

// ── Hospitais ──────────────────────────────────
const defaultHospitals = [
  { id: 1, name: 'Hospital São Rafael', address: 'Rua das Flores, 420 — Belo Horizonte, MG' },
  { id: 2, name: 'Clínica Vida Nova', address: 'Av. Paulista, 1200 — São Paulo, SP' },
  { id: 3, name: 'Instituto Renascer', address: 'Rua Dr. Campos, 88 — Contagem, MG' },
  { id: 4, name: 'Hospital Estética Premium', address: 'Rua dos Ipês, 300 — Belo Horizonte, MG' },
];

// ── Procedimentos ──────────────────────────────
const defaultProcedures = [
  { id: 1, category: 'Face', name: 'Rinoplastia', desc: 'Remodelação estética e/ou funcional do nariz.' },
  { id: 2, category: 'Face', name: 'Bichectomia', desc: 'Remoção das bolas de gordura de Bichat.' },
  { id: 3, category: 'Face', name: 'Mentoplastia', desc: 'Implante ou redução do mento (queixo).' },
  { id: 4, category: 'Face', name: 'Blefaroplastia', desc: 'Rejuvenescimento da região dos olhos.' },
  { id: 5, category: 'Corpo', name: 'Lipoaspiração', desc: 'Remoção localizada de gordura por sucção.' },
  { id: 6, category: 'Corpo', name: 'Abdominoplastia', desc: 'Correção do abdômen com retirada de pele.' },
  { id: 7, category: 'Corpo', name: 'Lipoescultura HD', desc: 'Definição muscular com lipo de alta definição.' },
  { id: 8, category: 'Mama', name: 'Mamoplastia de Aumento', desc: 'Implante de prótese de silicone.' },
  { id: 9, category: 'Mama', name: 'Mamoplastia Redutora', desc: 'Redução e remodelação das mamas.' },
  { id: 10, category: 'Mama', name: 'Mastopexia', desc: 'Elevação e rejuvenescimento das mamas.' },
  { id: 11, category: 'Íntimo', name: 'Labioplastia', desc: 'Remodelação dos pequenos lábios.' },
  { id: 12, category: 'Íntimo', name: 'Ninfoplastia', desc: 'Correção estética da região íntima feminina.' },
];

// ── Tabela de preços por procedimento/hospital ──
// Estrutura: { id, procedureId, hospitalId, avistaSem, avistacom, credito3xSem, credito3xCom }
const defaultPricing = [
  { id: 1, procedureId: 1, hospitalId: 1, avistaSem: 5000, avistaComPernoite: 7200, credito3xSem: 5750, credito3xComPernoite: 8280 },
  { id: 2, procedureId: 1, hospitalId: 2, avistaSem: 4500, avistaComPernoite: 6500, credito3xSem: 5175, credito3xComPernoite: 7475 },
  { id: 3, procedureId: 5, hospitalId: 1, avistaSem: 4800, avistaComPernoite: 7000, credito3xSem: 5520, credito3xComPernoite: 8050 },
  { id: 4, procedureId: 8, hospitalId: 3, avistaSem: 3800, avistaComPernoite: 5800, credito3xSem: 4370, credito3xComPernoite: 6670 },
  { id: 5, procedureId: 8, hospitalId: 4, avistaSem: 5500, avistaComPernoite: 8000, credito3xSem: 6325, credito3xComPernoite: 9200 },
];

// ── Anestesia ──────────────────────────────────
export const ANESTESIA_TEMPOS = [
  { id: '1h', label: 'Até 1 hora', avista: 1200, credito3x: 1380 },
  { id: '2h', label: 'Até 2 horas', avista: 1800, credito3x: 2070 },
  { id: '3h', label: 'Até 3 horas', avista: 2400, credito3x: 2760 },
  { id: '4h', label: 'Até 4 horas', avista: 3000, credito3x: 3450 },
  { id: '5h+', label: 'Acima de 4 horas', avista: 3800, credito3x: 4370 },
];

// ── Persistência ────────────────────────────────
const defaultOrders = [
  {
    id: 'ORC-0001',
    client: { name: 'Ana Paula Ribeiro', email: 'ana@email.com', phone: '(31) 98888-1111', cpf: '123.456.789-00' },
    employee: 'Dr. Marcos Silva',
    items: [defaultProcedures[0], defaultProcedures[1]],
    hospital: { name: 'Hospital São Rafael', address: 'Rua das Flores, 420', payType: 'À vista (Pix ou Dinheiro)', pernoite: false, valor: 5000 },
    anestesia: { tempo: 'Até 2 horas', payType: 'À vista (Pix ou Dinheiro)', valor: 1800 },
    total: 22500, obs: 'Paciente com histórico de rinite.',
    status: 'signed', createdAt: '20/02/2025', signedAt: '20/02/2025 14:32',
  },
  {
    id: 'ORC-0002',
    client: { name: 'Carla Mendes', email: 'carla@email.com', phone: '(31) 97777-2222', cpf: '987.654.321-00' },
    employee: 'Dra. Fernanda Costa',
    items: [defaultProcedures[4], defaultProcedures[6]],
    hospital: { name: 'Clínica Vida Nova', address: 'Av. Paulista, 1200', payType: 'Até 3x no Cartão', pernoite: true, valor: 6500 },
    anestesia: { tempo: 'Até 3 horas', payType: 'Até 3x no Cartão', valor: 2760 },
    total: 36000, obs: '',
    status: 'sent', createdAt: '24/02/2025', signedAt: null,
  },
  {
    id: 'ORC-0003',
    client: { name: 'Juliana Torres', email: 'ju@email.com', phone: '(11) 96666-3333', cpf: '111.222.333-44' },
    employee: 'Dr. Marcos Silva',
    items: [defaultProcedures[7]],
    hospital: { name: 'Hospital Estética Premium', address: 'Rua dos Ipês, 300', payType: 'À vista (Pix ou Dinheiro)', pernoite: false, valor: 5500 },
    anestesia: { tempo: 'Até 2 horas', payType: 'À vista (Pix ou Dinheiro)', valor: 1800 },
    total: 17000, obs: 'Prótese redonda, perfil moderado, 300cc.',
    status: 'draft', createdAt: '25/02/2025', signedAt: null,
  },
];

// Carrega orçamentos do localStorage, mesclando com os padrões caso falte algum
function loadOrders() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Garante que os orçamentos de demo estejam presentes (por ID)
      const savedIds = new Set(saved.map(o => o.id));
      const missing = defaultOrders.filter(o => !savedIds.has(o.id));
      const merged = [...missing, ...saved];
      // Atualiza localStorage se houve merge
      if (missing.length > 0) saveOrders(merged);
      return merged;
    }
  } catch (e) { /* ignora erros de parse */ }
  // Primeira vez: salva defaults no localStorage
  saveOrders(defaultOrders);
  return defaultOrders;
}

// Salva orçamentos no localStorage
function saveOrders(orders) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(orders)); } catch (e) { /* ignora */ }
}

// ── Store ──────────────────────────────────────
let _store = {
  hospitals: [...defaultHospitals],
  procedures: [...defaultProcedures],
  pricing: [...defaultPricing],
  orders: loadOrders(),
  _nextId: { hospital: 5, procedure: 13, pricing: 6 },
};

export const store = {
  // ── Reads ──
  getHospitals: () => _store.hospitals,
  getProcedures: () => _store.procedures,
  getPricing: () => _store.pricing,
  getOrders: () => _store.orders,
  getOrder: (id) => _store.orders.find(o => o.id === id),

  // Retorna pricing entries de um procedimento específico
  getPricingForProcedure: (procId) =>
    _store.pricing.filter(p => p.procedureId === procId),

  // Retorna pricing entries de um hospital específico num procedimento
  getPricingEntry: (procId, hospId) =>
    _store.pricing.find(p => p.procedureId === procId && p.hospitalId === hospId) || null,

  // ── Hospitals ──
  addHospital: ({ name, address }) => {
    const h = { id: _store._nextId.hospital++, name, address };
    _store.hospitals = [..._store.hospitals, h];
    return h;
  },
  updateHospital: (id, patch) => {
    _store.hospitals = _store.hospitals.map(h => h.id === id ? { ...h, ...patch } : h);
  },
  deleteHospital: (id) => {
    _store.hospitals = _store.hospitals.filter(h => h.id !== id);
    _store.pricing = _store.pricing.filter(p => p.hospitalId !== id);
  },

  // ── Procedures ──
  addProcedure: ({ name, category, desc }) => {
    const p = { id: _store._nextId.procedure++, name, category, desc };
    _store.procedures = [..._store.procedures, p];
    return p;
  },
  updateProcedure: (id, patch) => {
    _store.procedures = _store.procedures.map(p => p.id === id ? { ...p, ...patch } : p);
  },
  deleteProcedure: (id) => {
    _store.procedures = _store.procedures.filter(p => p.id !== id);
    _store.pricing = _store.pricing.filter(p => p.procedureId !== id);
  },

  // ── Pricing ──
  upsertPricing: (entry) => {
    // entry: { procedureId, hospitalId, avistaSem, avistaComPernoite, credito3xSem, credito3xComPernoite }
    const existing = _store.pricing.find(
      p => p.procedureId === entry.procedureId && p.hospitalId === entry.hospitalId
    );
    if (existing) {
      _store.pricing = _store.pricing.map(p =>
        p.id === existing.id ? { ...p, ...entry } : p
      );
    } else {
      _store.pricing = [..._store.pricing, { id: _store._nextId.pricing++, ...entry }];
    }
  },
  deletePricing: (procedureId, hospitalId) => {
    _store.pricing = _store.pricing.filter(
      p => !(p.procedureId === procedureId && p.hospitalId === hospitalId)
    );
  },

  // ── Orders ──
  addOrder: (order) => { _store.orders = [order, ..._store.orders]; saveOrders(_store.orders); },
  signOrder: (id) => {
    const now = new Date().toLocaleString('pt-BR');
    _store.orders = _store.orders.map(o =>
      o.id === id ? { ...o, status: 'signed', signedAt: now } : o
    );
    saveOrders(_store.orders);
  },
  nextOrderId: () => {
    const max = _store.orders.reduce((m, o) => {
      const n = parseInt(o.id.replace('ORC-', '')) || 0;
      return n > m ? n : m;
    }, 0);
    return 'ORC-' + String(max + 1).padStart(4, '0');
  },
};

export const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const STATUS_LABEL = {
  draft: { label: 'Rascunho', color: '#A08B74', bg: '#F5EDE0' },
  sent: { label: 'Enviado', color: '#9B6228', bg: '#FFF3E4' },
  signed: { label: 'Assinado', color: '#5A8A6A', bg: '#EBF4EE' },
};

export const CATEGORIES = ['Todos', 'Face', 'Corpo', 'Mama', 'Íntimo'];
export const PROC_CATEGORIES = ['Face', 'Corpo', 'Mama', 'Íntimo'];
export const EMPLOYEES = ['Dr. Marcos Silva', 'Dra. Fernanda Costa', 'Dra. Patrícia Lima'];
