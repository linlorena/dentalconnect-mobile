# 🚀 Backend - DentalConnect Mobile

Servidor Node.js + Express com arquitetura profissional, organizado em camadas para facilitar manutenção e expansão.

## 🏗️ Estrutura Profissional

```
backend/
├── config/
│   └── supabase.js      # Configuração do Supabase
├── controllers/
│   └── authController.js # Lógica de negócio
├── middleware/
│   └── validation.js     # Validações de entrada
├── routes/
│   └── auth.js          # Definição de rotas
├── services/
│   └── authService.js    # Serviços de dados
├── index.js              # Servidor principal
├── package.json          # Dependências
└── README.md             # Este arquivo
```

## 🎯 Arquitetura em Camadas

### **📁 Config (Configuração)**
- Configurações do Supabase
- Variáveis de ambiente
- Conexões externas

### **📁 Controllers (Controladores)**
- Recebe requisições HTTP
- Valida dados de entrada
- Chama serviços apropriados
- Retorna respostas HTTP

### **📁 Services (Serviços)**
- Lógica de negócio
- Comunicação com banco de dados
- Operações complexas

### **📁 Routes (Rotas)**
- Definição de endpoints
- Mapeamento URL → Controller
- Middleware de validação

### **📁 Middleware**
- Validações de entrada
- Autenticação
- Logs e monitoramento

## 🚀 Como Executar

### **1. Instalar dependências:**
```bash
npm install
```

### **2. Iniciar servidor:**
```bash
npm start
```

**Logs esperados:**
```
🚀 Backend iniciando...
🔗 Configuração Supabase carregada
🚀 Servidor rodando na porta 3001
📱 API disponível em: http://localhost:3001/api
📋 Rotas disponíveis:
  - GET  /api/test
  - POST /api/cadastro
  - POST /api/login
```

## 📋 Rotas Disponíveis

### **GET /api/test**
- **Descrição:** Teste da API
- **Resposta:** `{"message": "Backend funcionando! 🎉"}`

### **POST /api/cadastro**
- **Descrição:** Criar novo usuário
- **Validações:** Campos obrigatórios, formato email, formato CPF, senha mínima
- **Body:**
  ```json
  {
    "nome": "string",
    "cpf": "XXX.XXX.XXX-XX",
    "telefone": "string",
    "dataNascimento": "string",
    "email": "email@valido.com",
    "senha": "min8caracteres",
    "estado": "string",
    "cidade": "string"
  }
  ```

### **POST /api/login**
- **Descrição:** Autenticar usuário
- **Validações:** Email e senha obrigatórios, formato email
- **Body:**
  ```json
  {
    "email": "email@valido.com",
    "senha": "string"
  }
  ```

## 🔧 Funcionalidades

1. **✅ Arquitetura em camadas** para fácil manutenção
2. **✅ Validações robustas** com middleware dedicado
3. **✅ Serviços separados** para lógica de negócio
4. **✅ Controladores limpos** para requisições HTTP
5. **✅ Tratamento de erros** centralizado
6. **✅ Logs detalhados** para debug
7. **✅ Rollback automático** em caso de falha

## 🗄️ Banco de Dados

- **Supabase Auth:** Usuários e autenticação
- **Tabela `user`:** Perfis completos dos usuários
- **Campos:** id, nome, email, senha, cpf, telefone, data_nascimento, tipo, cidade, estado

## 🔍 Fluxo de Cadastro

```
1. 📝 Recebe dados → Middleware de validação
2. 🔐 Cria usuário no Supabase Auth
3. 👤 Cria perfil na tabela user
4. ✅ Retorna sucesso
   └─ Se falhar no perfil → 🗑️ Deleta usuário auth (rollback)
```

## 🚨 Tratamento de Erros

- **Validação:** Middleware valida entrada antes de processar
- **Auth:** Erros do Supabase Auth são tratados
- **Perfil:** Erros na criação do perfil acionam rollback
- **Global:** Middleware captura erros não tratados

## 🔧 Configuração

- **Porta:** 3001 (configurável via variável de ambiente)
- **CORS:** Habilitado para desenvolvimento
- **Supabase:** Configurado com service role key
- **Validações:** Regex para email e CPF

## 📱 Integração com Frontend

O frontend faz requisições HTTP para:
- `http://localhost:3001/api/cadastro`
- `http://localhost:3001/api/login`

## 🚀 Vantagens da Nova Estrutura

1. **✅ Separação de responsabilidades** clara
2. **✅ Fácil de expandir** com novas funcionalidades
3. **✅ Código reutilizável** entre rotas
4. **✅ Testes unitários** facilitados
5. **✅ Manutenção simplificada**
6. **✅ Padrão profissional** de mercado

## 🚀 Próximos Passos

1. **Adicionar mais rotas** (usuários, consultas, dentistas)
2. **Implementar JWT** para sessões
3. **Adicionar middleware** de autenticação
4. **Criar testes** automatizados
5. **Implementar logs** em arquivo
6. **Adicionar documentação** da API (Swagger)
