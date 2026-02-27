# Sistema de Orçamentos — Cirurgia Estética

## Páginas

| Rota | Quem acessa | O que faz |
|------|-------------|-----------|
| `/admin` | Funcionário | Dashboard: lista orçamentos, edita preços, copia links |
| `/admin/novo` | Funcionário | Cria novo orçamento (dados do paciente + procedimentos) |
| `/assinar/:id` | Paciente | Visualiza o orçamento, lê o termo e assina digitalmente |

## Fluxo

1. Funcionário acessa `/admin/novo`
2. Preenche dados do paciente e seleciona procedimentos
3. Clica em **"Gerar e enviar link"** → orçamento salvo como `sent`
4. Link `/assinar/:id` é copiado automaticamente para enviar ao paciente
5. Paciente abre o link, lê o orçamento, assina e confirma
6. Status muda para `signed` e aparece no dashboard

## Ações no dashboard

- **Copiar link** → copia o link de assinatura para enviar por WhatsApp/e-mail
- **Abrir** → abre a página do orçamento (pode imprimir como PDF pelo botão no header)
- **Editar preço** → clica no valor do procedimento para editar inline

## Rodar localmente

```bash
npm install
npm start
```

## Deploy na Vercel

1. Suba para GitHub
2. Importe na vercel.com
3. Deploy automático
