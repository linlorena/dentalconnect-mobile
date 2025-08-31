# Backend - DentalConnect Mobile
## Estrutura 

```
backend/
├── config/
│   └── supabase.js      
├── controllers/
│   └── authController.js 
├── middleware/
│   └── validation.js     
├── routes/
│   └── auth.js          
├── services/
│   └── authService.js    
├── index.js              
├── package.json          
└── README.md             
```

## Como Executar

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
Backend iniciando...
Configuração Supabase carregada
Servidor rodando na porta 3001
API disponível em: http://localhost:3001/api
Rotas disponíveis:
  - GET  /api/test
  - POST /api/cadastro
  - POST /api/login
```

## Rotas Disponíveis

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

