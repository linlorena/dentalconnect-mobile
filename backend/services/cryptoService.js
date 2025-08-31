const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class CryptoService {
  constructor() {
    this.saltRounds = 12;
    this.jwtSecret = process.env.JWT_SECRET || 'dentalconnect-secret-key-2024';
  }

  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      console.error('Erro ao criptografar senha:', error);
      throw new Error('Falha na criptografia da senha');
    }
  }

  async comparePassword(password, hash) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      console.error('Erro ao comparar senhas:', error);
      throw new Error('Falha na verificação da senha');
    }
  }

  generateToken(userId, email) {
    try {
      const payload = {
        userId,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
      };

      const token = jwt.sign(payload, this.jwtSecret);
      return token;
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      throw new Error('Falha na geração do token');
    }
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw new Error('Token inválido ou expirado');
    }
  }
}

module.exports = new CryptoService();
