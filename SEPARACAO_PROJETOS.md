# Projeto Rivvo - Estrutura Separada

Este projeto foi reorganizado para separar o frontend do backend em projetos independentes.

## 📁 Estrutura do Projeto

```
C:\
├── corrida-app/          # 📱 Frontend (React Native/Expo)
│   ├── app/              # Páginas e rotas
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Context API (Auth, etc.)
│   ├── constants/        # Configurações e constantes
│   ├── hooks/            # Custom hooks
│   ├── assets/           # Imagens, fontes, etc.
│   └── package.json      # Dependências do frontend
│
└── corrida-backend/      # 🚀 Backend (Node.js/Express)
    ├── config/           # Configurações (DB, Swagger, etc.)
    ├── routes/           # Rotas da API
    ├── middleware/       # Middlewares (auth, etc.)
    ├── database/         # Scripts de banco de dados
    └── package.json      # Dependências do backend
```

## 🚀 Como executar

### Frontend (React Native/Expo)
```bash
cd C:\corrida-app
npm install
npx expo start
```

### Backend (Node.js/Express)
```bash
cd C:\corrida-backend
npm install
npm run dev
```

## 🔧 Configuração

### Backend
1. Configure as variáveis de ambiente no arquivo `.env`:
```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/corrida_db
JWT_SECRET=your-secret-key
```

2. Configure o banco de dados:
```bash
npm run db:setup
```

### Frontend
1. Atualize as constantes de API em `constants/Api.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:3000'; // URL do backend
```

## 🔗 Integração

O frontend se conecta ao backend através das seguintes URLs:
- **Autenticação**: `POST /api/auth/login`, `POST /api/auth/register`
- **Usuários**: `GET /api/users/profile`, `PUT /api/users/profile`
- **Corridas**: `GET /api/running/sessions`, `POST /api/running/start`
- **Amigos**: `GET /api/friends`, `POST /api/friends/add`
- **Conquistas**: `GET /api/achievements`
- **Música**: `GET /api/music/sync`

## 📦 Deploy

### Backend
- Deploy no Heroku, Railway, ou qualquer serviço de Node.js
- Configure variáveis de ambiente de produção
- Use PostgreSQL como banco de dados

### Frontend
- Build APK: `npx eas build --platform android`
- Deploy na Google Play Store ou distribuição interna

## 🎯 Benefícios da Separação

1. **Desenvolvimento independente**: Frontend e backend podem ser desenvolvidos separadamente
2. **Deploy independente**: Cada parte pode ser deployada em serviços diferentes
3. **Escalabilidade**: Backend pode servir múltiplos clientes (web, mobile, etc.)
4. **Manutenção**: Código mais organizado e fácil de manter
5. **Colaboração**: Diferentes desenvolvedores podem trabalhar em cada parte

## 🛠️ Desenvolvimento

- **Frontend**: Use Expo Go para testes rápidos no celular
- **Backend**: Use Postman para testar APIs
- **Debug**: Configure debug separado para cada projeto
- **Git**: Considere criar repositórios separados para versionamento independente
