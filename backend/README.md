# 🏃‍♂️ Corrida App - Backend

Backend completo para o aplicativo de corrida social com GPS, música sincronizada e corridas em grupo.

## 🚀 **Funcionalidades**

### **👥 Usuários e Autenticação**
- ✅ Registro e login com JWT
- ✅ Perfis personalizáveis
- ✅ Sistema de amigos e solicitações
- ✅ Configurações personalizáveis
- ✅ Estatísticas de corrida

### **🏃‍♂️ Rastreamento de Corrida**
- ✅ Sessões de corrida individuais e em grupo
- ✅ Rastreamento GPS em tempo real
- ✅ Métricas detalhadas (distância, tempo, pace, velocidade)
- ✅ Histórico completo de corridas
- ✅ Participação em corridas em grupo

### **🎵 Música Sincronizada**
- ✅ Sessões de música compartilhadas
- ✅ Playlists colaborativas
- ✅ Controle de reprodução pelo host
- ✅ Sincronização em tempo real
- ✅ Participação em sessões públicas

### **🏆 Sistema de Conquistas**
- ✅ Conquistas por categoria (distância, velocidade, consistência)
- ✅ Desafios personalizáveis
- ✅ Rankings competitivos
- ✅ Progresso em tempo real
- ✅ Sistema de níveis

### **👥 Sistema Social**
- ✅ Amizades e solicitações
- ✅ Busca de usuários
- ✅ Bloqueio de usuários
- ✅ Notificações
- ✅ Privacidade configurável

## 🛠️ **Tecnologias**

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados principal
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## 📋 **Pré-requisitos**

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🚀 **Instalação**

### **1. Clone o repositório**
```bash
git clone <repository-url>
cd corrida-app/backend
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure o banco de dados**
```bash
# Execute o script SQL para criar as tabelas
npm run db:setup
```

### **4. Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do backend:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=July@100312

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=corrida_app_super_secret_key_2024

# Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **5. Inicie o servidor**
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Principais**
- **users** - Usuários e perfis
- **friendships** - Relacionamentos de amizade
- **running_sessions** - Sessões de corrida
- **route_points** - Pontos GPS das rotas
- **music_sessions** - Sessões de música
- **playlists** - Músicas das sessões
- **achievements** - Conquistas dos usuários
- **challenges** - Desafios disponíveis
- **user_settings** - Configurações dos usuários

### **Índices e Performance**
- Índices otimizados para consultas frequentes
- Triggers para atualização automática de estatísticas
- Funções para cálculos complexos

## 📚 **API Endpoints**

### **🔐 Autenticação**
```
POST /api/auth/register     - Registro de usuário
POST /api/auth/login        - Login
GET  /api/auth/verify       - Verificar token
PUT  /api/auth/change-password - Alterar senha
POST /api/auth/logout       - Logout
```

### **👤 Usuários**
```
GET  /api/users/profile     - Obter perfil
PUT  /api/users/profile     - Atualizar perfil
GET  /api/users/stats       - Estatísticas
GET  /api/users/runs        - Histórico de corridas
GET  /api/users/settings    - Configurações
PUT  /api/users/settings    - Atualizar configurações
GET  /api/users/search      - Buscar usuários
```

### **🏃‍♂️ Corridas**
```
POST   /api/running/sessions           - Iniciar sessão
PUT    /api/running/sessions/:id       - Finalizar sessão
POST   /api/running/sessions/:id/points - Adicionar ponto GPS
GET    /api/running/sessions/:id/points - Obter pontos da rota
GET    /api/running/sessions           - Listar sessões
GET    /api/running/sessions/:id       - Obter sessão específica
POST   /api/running/sessions/:id/join  - Participar de corrida em grupo
POST   /api/running/sessions/:id/leave - Sair de corrida em grupo
```

### **🎵 Música**
```
POST   /api/music/sessions             - Criar sessão de música
GET    /api/music/sessions             - Listar sessões públicas
GET    /api/music/sessions/:id         - Obter sessão específica
POST   /api/music/sessions/:id/join    - Participar de sessão
POST   /api/music/sessions/:id/leave   - Sair de sessão
POST   /api/music/sessions/:id/playlist - Adicionar música
DELETE /api/music/sessions/:id/playlist/:trackId - Remover música
PUT    /api/music/sessions/:id/control - Controlar reprodução
```

### **👥 Amigos**
```
POST   /api/friends/requests           - Enviar solicitação
GET    /api/friends/requests           - Solicitações pendentes
PUT    /api/friends/requests/:id       - Responder solicitação
GET    /api/friends/list               - Lista de amigos
DELETE /api/friends/:id                - Remover amigo
POST   /api/friends/block/:userId      - Bloquear usuário
POST   /api/friends/unblock/:userId    - Desbloquear usuário
GET    /api/friends/stats              - Estatísticas de amizades
```

### **🏆 Conquistas e Desafios**
```
GET    /api/achievements/user          - Conquistas do usuário
GET    /api/achievements/available     - Conquistas disponíveis
GET    /api/achievements/stats         - Estatísticas de conquistas
POST   /api/achievements/challenges    - Criar desafio
GET    /api/achievements/challenges    - Listar desafios
POST   /api/achievements/challenges/:id/join - Participar de desafio
GET    /api/achievements/challenges/:id/ranking - Ranking do desafio
PUT    /api/achievements/challenges/:id/progress - Atualizar progresso
```

## 🔒 **Segurança**

### **Autenticação JWT**
- Tokens com expiração de 7 dias
- Refresh automático de tokens
- Validação em todas as rotas protegidas

### **Validação de Dados**
- Validação de entrada com express-validator
- Sanitização de dados
- Prevenção de SQL injection

### **Rate Limiting**
- Limite de 100 requisições por 15 minutos
- Proteção contra ataques de força bruta
- Headers de retry informativos

### **Headers de Segurança**
- Helmet.js para headers de segurança
- CORS configurado adequadamente
- Proteção contra ataques comuns

## 📊 **Monitoramento e Logs**

### **Logs Estruturados**
- Timestamp em todas as requisições
- Logs de erro detalhados
- Rastreamento de performance

### **Health Checks**
```
GET /health - Status do servidor
GET /      - Informações da API
```

## 🚀 **Deploy e Produção**

### **Variáveis de Ambiente**
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret
```

### **Process Manager**
```bash
# Usar PM2 para produção
npm install -g pm2
pm2 start server.js --name "corrida-app-backend"
pm2 startup
pm2 save
```

### **Docker (Opcional)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 **Testes**

### **Executar Testes**
```bash
npm test
```

### **Cobertura de Código**
```bash
npm run test:coverage
```

## 📝 **Scripts Disponíveis**

```bash
npm start          # Iniciar servidor de produção
npm run dev        # Iniciar servidor de desenvolvimento
npm run db:setup   # Configurar banco de dados
npm run db:reset   # Resetar banco de dados
npm test           # Executar testes
```

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 **Suporte**

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentação**: [Wiki](https://github.com/your-repo/wiki)
- **Email**: support@corridaapp.com

## 🔮 **Roadmap**

### **Versão 1.1**
- [ ] Sistema de notificações push
- [ ] Integração com wearables
- [ ] Análise avançada de performance

### **Versão 1.2**
- [ ] Chat em tempo real
- [ ] Eventos de corrida
- [ ] Gamificação avançada

### **Versão 2.0**
- [ ] IA para recomendações
- [ ] Integração com redes sociais
- [ ] Marketplace de equipamentos

---

**Desenvolvido com ❤️ para a comunidade de corredores!** 🏃‍♂️ 