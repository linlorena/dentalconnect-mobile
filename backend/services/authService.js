const { supabase } = require('../config/supabase');
const cryptoService = require('./cryptoService');

class AuthService {
  // Criar usuário no Supabase Auth (sem email automático)
  async createUser(email, password) {
    try {
      console.log('Criando usuário no Auth...');
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        email_confirm_redirect_to: null,
        user_metadata: { role: 'paciente' }
      });

      if (error) {
        console.error('Erro no Auth:', error);
        throw error;
      }

      console.log('Usuário criado no Auth:', data.user.id);
      return data.user;
    } catch (error) {
      console.error('Erro no createUser:', error);
      throw error;
    }
  }

  // Criar perfil na tabela user
  async createProfile(userId, userData) {
    try {
      console.log('Criando perfil na tabela user...');
      
      const dataParts = userData.dataNascimento.split('/');
      const dataFormatada = `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`;
      
      console.log('Data convertida:', dataFormatada);
      console.log('ID do usuário Auth:', userId);
      
      const senhaCriptografada = await cryptoService.hashPassword(userData.senha);
      
      const { data, error } = await supabase
        .from('user')
        .insert([
          {
            nome: userData.nome,
            email: userData.email,
            senha: senhaCriptografada,
            cpf: userData.cpf,
            data_nascimento: dataFormatada,
            tipo: 'paciente',
            cidade: userData.cidade,
            estado: userData.estado
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        throw error;
      }

      console.log('Perfil criado com sucesso!');
      console.log('ID gerado pelo Supabase:', data[0].id);
      
      return { 
        numericId: data[0].id,
        userData: data[0] 
      };
    } catch (error) {
      console.error('Erro no createProfile:', error);
      throw error;
    }
  }

  // Deletar usuário do Auth (rollback)
  async deleteUser(userId) {
    try {
      console.log('Deletando usuário auth:', userId);
      
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error('Erro ao deletar usuário auth:', error);
        throw error;
      }

      console.log('Usuário auth deletado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro no deleteUser:', error);
      throw error;
    }
  }

  // Fazer login
  async login(email, password) {
    try {
      console.log('Tentando fazer login com:', email);
      
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        console.log('Usuário não encontrado na tabela user');
        throw new Error('Credenciais inválidas');
      }

      let senhaValida = false;
      
      // Verifica se a senha está criptografada (bcrypt gera hashes de 60 caracteres)
      if (userData.senha && userData.senha.length === 60) {
        // Senha criptografada - usa bcrypt
        console.log('Verificando senha criptografada...');
        senhaValida = await cryptoService.comparePassword(password, userData.senha);
      } else {
        // Senha antiga em texto plano - compara diretamente
        console.log('Verificando senha antiga (texto plano)...');
        senhaValida = (userData.senha === password);
        
        // Se a senha antiga for válida, atualiza para criptografada
        if (senhaValida) {
          console.log('Atualizando senha antiga para criptografada...');
          try {
            const hashedPassword = await cryptoService.hashPassword(password);
            
            const { error: updateError } = await supabase
              .from('user')
              .update({ senha: hashedPassword })
              .eq('id', userData.id);
              
            if (updateError) {
              console.log('Aviso: Não foi possível atualizar a senha:', updateError);
            } else {
              console.log('Senha atualizada com sucesso para criptografada');
            }
          } catch (hashError) {
            console.log('Aviso: Erro ao criptografar senha antiga:', hashError);
          }
        }
      }
      
      if (!senhaValida) {
        console.log('Senha inválida');
        throw new Error('Credenciais inválidas');
      }

      // Fazer login no Supabase 
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password, 
      });

      if (error) {
        console.log('Erro no Auth:', error);
        throw new Error('Erro na autenticação');
      }

      // Gerar token JWT
      const token = cryptoService.generateToken(userData.id, userData.email);

      console.log('Login bem-sucedido via backend');
      
      return {
        ...data.user,
        token,
        userProfile: userData
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
