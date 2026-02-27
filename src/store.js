// Store em memória — simula backend para demonstração

export const defaultProcedures = [
  { id:1,  category:'Face',    name:'Rinoplastia',              price:18000, desc:'Remodelação estética e/ou funcional do nariz.' },
  { id:2,  category:'Face',    name:'Bichectomia',              price:4500,  desc:'Remoção das bolas de gordura de Bichat.' },
  { id:3,  category:'Face',    name:'Mentoplastia',             price:6800,  desc:'Implante ou redução do mento (queixo).' },
  { id:4,  category:'Face',    name:'Blefaroplastia',           price:9200,  desc:'Rejuvenescimento da região dos olhos.' },
  { id:5,  category:'Corpo',   name:'Lipoaspiração',            price:14000, desc:'Remoção localizada de gordura por sucção.' },
  { id:6,  category:'Corpo',   name:'Abdominoplastia',          price:16500, desc:'Correção do abdômen com retirada de pele.' },
  { id:7,  category:'Corpo',   name:'Lipoescultura HD',         price:22000, desc:'Definição muscular com lipo de alta definição.' },
  { id:8,  category:'Mama',    name:'Mamoplastia de Aumento',   price:17000, desc:'Implante de prótese de silicone.' },
  { id:9,  category:'Mama',    name:'Mamoplastia Redutora',     price:15000, desc:'Redução e remodelação das mamas.' },
  { id:10, category:'Mama',    name:'Mastopexia',               price:14500, desc:'Elevação e rejuvenescimento das mamas.' },
  { id:11, category:'Íntimo',  name:'Labioplastia',             price:7500,  desc:'Remodelação dos pequenos lábios.' },
  { id:12, category:'Íntimo',  name:'Ninfoplastia',             price:6800,  desc:'Correção estética da região íntima feminina.' },
];

let _store = {
  procedures: [...defaultProcedures],
  orders: [
    {
      id: 'ORC-0001',
      client: { name: 'Ana Paula Ribeiro', email: 'ana@email.com', phone: '(31) 98888-1111', cpf: '123.456.789-00' },
      employee: 'Dr. Marcos Silva',
      items: [defaultProcedures[0], defaultProcedures[1]],
      total: 22500,
      obs: 'Paciente com histórico de rinite. Avaliar septoplastia concomitante.',
      status: 'signed',
      createdAt: '20/02/2025',
      signedAt: '20/02/2025 14:32',
    },
    {
      id: 'ORC-0002',
      client: { name: 'Carla Mendes', email: 'carla@email.com', phone: '(31) 97777-2222', cpf: '987.654.321-00' },
      employee: 'Dra. Fernanda Costa',
      items: [defaultProcedures[4], defaultProcedures[6]],
      total: 36000,
      obs: '',
      status: 'sent',
      createdAt: '24/02/2025',
      signedAt: null,
    },
    {
      id: 'ORC-0003',
      client: { name: 'Juliana Torres', email: 'ju@email.com', phone: '(11) 96666-3333', cpf: '111.222.333-44' },
      employee: 'Dr. Marcos Silva',
      items: [defaultProcedures[7]],
      total: 17000,
      obs: 'Prótese redonda, perfil moderado, 300cc.',
      status: 'draft',
      createdAt: '25/02/2025',
      signedAt: null,
    },
  ],
};

export const store = {
  getProcedures: ()  => _store.procedures,
  getOrders:     ()  => _store.orders,
  getOrder:      (id) => _store.orders.find(o => o.id === id),

  addOrder: (order) => {
    _store.orders = [order, ..._store.orders];
  },

  updateOrder: (id, patch) => {
    _store.orders = _store.orders.map(o => o.id === id ? { ...o, ...patch } : o);
  },

  signOrder: (id) => {
    const now = new Date().toLocaleString('pt-BR');
    _store.orders = _store.orders.map(o =>
      o.id === id ? { ...o, status: 'signed', signedAt: now } : o
    );
  },

  updateProcedurePrice: (id, price) => {
    _store.procedures = _store.procedures.map(p => p.id === id ? { ...p, price } : p);
  },

  nextOrderId: () => {
    const max = _store.orders.reduce((m, o) => {
      const n = parseInt(o.id.replace('ORC-', '')) || 0;
      return n > m ? n : m;
    }, 0);
    return 'ORC-' + String(max + 1).padStart(4, '0');
  },
};

export const fmt = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const STATUS_LABEL = {
  draft:  { label: 'Rascunho',   color: '#A08B74', bg: '#F5EDE0' },
  sent:   { label: 'Enviado',    color: '#9B6228', bg: '#FFF3E4' },
  signed: { label: 'Assinado',   color: '#5A8A6A', bg: '#EBF4EE' },
};

export const CATEGORIES = ['Todos', 'Face', 'Corpo', 'Mama', 'Íntimo'];
export const EMPLOYEES  = ['Dr. Marcos Silva', 'Dra. Fernanda Costa', 'Dra. Patrícia Lima'];
