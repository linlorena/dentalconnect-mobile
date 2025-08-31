const authService = require('../services/authService');

class AuthController {
  // Cadastro de usuário
  async cadastro(req, res) {
    try {
      console.log('Recebendo cadastro:', req.body);
      
      const { nome, cpf, dataNascimento, email, senha, estado, cidade } = req.body;
      
      const authUser = await authService.createUser(email, senha);
      
      try {
        const profileResult = await authService.createProfile(authUser.id, {
          nome,
          cpf,
          dataNascimento,
          email,
          senha,
          estado,
          cidade
        });
        
        res.json({
          success: true,
          message: 'Usuário criado com sucesso!',
          user: {
            id: profileResult.numericId,
            authId: authUser.id,
            email: authUser.email,
            nome
          }
        });
        
      } catch (profileError) {
        console.error('Erro ao criar perfil, fazendo rollback...');
        await authService.deleteUser(authUser.id);
        
        return res.status(400).json({ 
          error: 'Erro ao criar perfil: ' + profileError.message 
        });
      }
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Login de usuário
  async login(req, res) {
    try {
      console.log('Recebendo login:', req.body);
      
      const { email, senha } = req.body;
      
      const user = await authService.login(email, senha);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          token: user.token,
          profile: user.userProfile
        }
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(400).json({ 
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();
