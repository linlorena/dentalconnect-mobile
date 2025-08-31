const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateCadastro, validateLogin } = require('../middleware/validation');

// Rota de cadastro
router.post('/cadastro', validateCadastro, authController.cadastro);

// Rota de login
router.post('/login', validateLogin, authController.login);

module.exports = router;
