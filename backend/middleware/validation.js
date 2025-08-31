// Middleware de validação para cadastro
const validateCadastro = (req, res, next) => {
  const { nome, cpf, dataNascimento, email, senha, estado, cidade } = req.body;
  
  if (!nome || !cpf || !dataNascimento || !email || !senha || !estado || !cidade) {
    return res.status(400).json({ 
      error: 'Todos os campos são obrigatórios' 
    });
  }
  
  // Validação de senha
  if (senha.length < 8) {
    return res.status(400).json({ 
      error: 'Senha deve ter pelo menos 8 caracteres' 
    });
  }
  
  // Validação de email - apenas verifica se não está vazio
  if (!email || email.trim() === '') {
    return res.status(400).json({ 
      error: 'Email é obrigatório' 
    });
  }
  
  // Validação de CPF (formato básico)
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!cpfRegex.test(cpf)) {
    return res.status(400).json({ 
      error: 'CPF deve estar no formato XXX.XXX.XXX-XX' 
    });
  }
  
  next();
};

// Middleware de validação para login
const validateLogin = (req, res, next) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ 
      error: 'Email e senha são obrigatórios' 
    });
  }
  
  // Validação de email - apenas verifica se não está vazio
  if (!email || email.trim() === '') {
    return res.status(400).json({ 
      error: 'Email é obrigatório' 
    });
  }
  
  next();
};

module.exports = {
  validateCadastro,
  validateLogin
};
