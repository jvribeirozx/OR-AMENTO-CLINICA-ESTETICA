// Dados dos hospitais, formas de pagamento e anestesia

export const HOSPITALS = [
  {
    id: 1,
    name: "Hospital São Rafael",
    address: "Rua das Flores, 420 — Belo Horizonte, MG",
    payment: {
      avista: {
        label: "À vista (Pix ou Dinheiro)",
        semPernoite: 3200,
        comPernoite: 5100,
      },
      credito3x: {
        label: "Até 3x no Cartão de Crédito",
        semPernoite: 3680,
        comPernoite: 5865,
      },
    },
  },
  {
    id: 2,
    name: "Clínica Vida Nova",
    address: "Av. Paulista, 1200 — São Paulo, SP",
    payment: {
      avista: {
        label: "À vista (Pix ou Dinheiro)",
        semPernoite: 2800,
        comPernoite: 4500,
      },
      credito3x: {
        label: "Até 3x no Cartão de Crédito",
        semPernoite: 3220,
        comPernoite: 5175,
      },
    },
  },
  {
    id: 3,
    name: "Instituto Renascer",
    address: "Rua Dr. Campos, 88 — Contagem, MG",
    payment: {
      avista: {
        label: "À vista (Pix ou Dinheiro)",
        semPernoite: 2500,
        comPernoite: 4100,
      },
      credito3x: {
        label: "Até 3x no Cartão de Crédito",
        semPernoite: 2875,
        comPernoite: 4715,
      },
    },
  },
  {
    id: 4,
    name: "Hospital Estética Premium",
    address: "Rua dos Ipês, 300 — Belo Horizonte, MG",
    payment: {
      avista: {
        label: "À vista (Pix ou Dinheiro)",
        semPernoite: 4200,
        comPernoite: 6800,
      },
      credito3x: {
        label: "Até 3x no Cartão de Crédito",
        semPernoite: 4830,
        comPernoite: 7820,
      },
    },
  },
];

export const ANESTESIA_TEMPOS = [
  {
    id: "1h",
    label: "Até 1 hora",
    payment: {
      avista:    { label: "À vista (Pix ou Dinheiro)", valor: 1200 },
      credito3x: { label: "Até 3x no Cartão de Crédito", valor: 1380 },
    },
  },
  {
    id: "2h",
    label: "Até 2 horas",
    payment: {
      avista:    { label: "À vista (Pix ou Dinheiro)", valor: 1800 },
      credito3x: { label: "Até 3x no Cartão de Crédito", valor: 2070 },
    },
  },
  {
    id: "3h",
    label: "Até 3 horas",
    payment: {
      avista:    { label: "À vista (Pix ou Dinheiro)", valor: 2400 },
      credito3x: { label: "Até 3x no Cartão de Crédito", valor: 2760 },
    },
  },
  {
    id: "4h",
    label: "Até 4 horas",
    payment: {
      avista:    { label: "À vista (Pix ou Dinheiro)", valor: 3000 },
      credito3x: { label: "Até 3x no Cartão de Crédito", valor: 3450 },
    },
  },
  {
    id: "5h+",
    label: "Acima de 4 horas",
    payment: {
      avista:    { label: "À vista (Pix ou Dinheiro)", valor: 3800 },
      credito3x: { label: "Até 3x no Cartão de Crédito", valor: 4370 },
    },
  },
];
