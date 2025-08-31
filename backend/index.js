const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

      console.log('Backend iniciando...');

      require('./config/supabase');

      const authRoutes = require('./routes/auth');

      app.get('/api/test', (req, res) => {
        res.json({ message: 'Backend funcionando!' });
      });

      app.use('/api', authRoutes);

      app.use('*', (req, res) => {
        res.status(404).json({ error: 'Rota não encontrada' });
      });

      app.use((error, req, res, next) => {
        console.error('Erro não tratado:', error);
        res.status(500).json({
          error: 'Erro interno do servidor'
        });
      });

      app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`API disponível em: http://localhost:${PORT}/api`);
        console.log('Rotas disponíveis:');
        console.log('  - GET  /api/test');
        console.log('  - POST /api/cadastro');
        console.log('  - POST /api/login');
      });
