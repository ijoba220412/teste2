# 📋 MEDSYS - SISTEMA DE GESTÃO MÉDICA

Sistema completo para gestão de prescrições médicas, pacientes, profissionais e instituições de saúde.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização utilitária
- **Firebase Firestore** - Banco de dados em tempo real
- **Zod** - Validação de schemas
- **Lucide React** - Ícones modernos

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Página principal
│   ├── instituicoes/      # Gestão de instituições
│   ├── profissionais/     # Gestão de profissionais
│   ├── pacientes/         # Gestão de pacientes
│   ├── medicamentos/      # Catálogo de medicamentos
│   └── receitas/          # Emissão de receitas
├── components/
│   └── ui/                # Componentes reutilizáveis
│       ├── Button.tsx     # Botão com variantes
│       ├── Card.tsx       # Container estilizado
│       ├── Input.tsx      # Campo de texto/textarea
│       ├── Select.tsx     # Dropdown customizado
│       ├── Modal.tsx      # Modal responsivo
│       ├── Table.tsx      # Tabela genérica
│       ├── Toast.tsx      # Sistema de notificações
│       └── ErrorBoundary.tsx # Tratamento de erros
├── hooks/
│   └── useFirestore.ts    # Hook para operações no Firebase
├── types/
│   └── index.ts           # Tipos TypeScript
├── utils/
│   ├── validation.ts      # Schemas Zod
│   ├── audit.ts           # LGPD e auditoria
│   ├── masks.ts           # Máscaras de input
│   ├── formatDate.ts      # Formatação de datas
│   └── generateHorarios.ts # Geração de horários
└── lib/
    └── firebase.ts        # Configuração do Firebase
```

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Cadastro de instituições de saúde
- [x] Gestão de profissionais (médicos, farmacêuticos)
- [x] Registro de pacientes
- [x] Catálogo de medicamentos
- [x] Emissão de receitas médicas
- [x] Geração de PDF para impressão
- [x] Dashboard com visão geral
- [x] Componentes UI reutilizáveis
- [x] Validação de dados com Zod
- [x] Sistema de auditoria (LGPD)
- [x] Error Boundary global
- [x] Toast notifications

### 📋 Em Planejamento
- [ ] Autenticação de usuários
- [ ] Testes automatizados
- [ ] Dashboard com gráficos
- [ ] Busca avançada com filtros
- [ ] Exportação de relatórios
- [ ] Versão mobile otimizada

## 🔐 LGPD e Segurança

O sistema inclui:
- **Log de Auditoria**: Todas as operações são registradas
- **Consentimento LGPD**: Controle de consentimento dos pacientes
- **Exportação de Dados**: Direito à portabilidade
- **Exclusão de Dados**: Direito ao esquecimento

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Laptop (1366px)
- Tablet (768px)
- Mobile (375px)

## 🎨 Design System

### Cores
- **Primária**: `teal-700` (#0d9488)
- **Secundária**: `teal-100` (#ccfbf1)
- **Fundo**: `slate-50` (#f8fafc)
- **Texto**: `slate-900` (#0f172a)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Estilo**: UPPERCASE em todo o sistema
- **Peso**: Bold/Black para títulos

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para a área da saúde**
