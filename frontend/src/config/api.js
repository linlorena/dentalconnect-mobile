// Configuração da API com detecção automática do host (Expo/Metro)
import Constants from 'expo-constants';

const getHostFromExpo = () => {
  // SDKs mais antigos: Constants.manifest?.debuggerHost
  // SDKs recentes: Constants.expoConfig?.hostUri
  const debuggerHost = (Constants?.manifest && Constants?.manifest?.debuggerHost)
    || (Constants?.expoConfig && Constants?.expoConfig?.hostUri);

  if (debuggerHost && typeof debuggerHost === 'string') {
    // debuggerHost exemplo: "192.168.0.10:8081" -> extrai apenas o host/IP
    const host = debuggerHost.split(':')[0];
    if (host) return host;
  }
  return null;
};

const getBaseURL = () => {
  const detectedHost = getHostFromExpo();
  if (detectedHost) {
    return `http://${detectedHost}:3001/api`;
  }

  // Fallbacks caso não seja possível detectar (ex.: build standalone)
  const fallbacks = [
    'http://localhost:3001/api',
    'http://192.168.0.10:3001/api',
    'http://192.168.0.92:3001/api'
  ];
  return fallbacks[0];
};

const API_CONFIG = {
  BASE_URL: getBaseURL(),
  ENDPOINTS: {
    LOGIN: '/login',
    USERS: '/users',
    LOCALS: '/locals',
    DENTISTS: '/dentists/nome',
    CONSULTATION: '/consultation',
    SERVICES: '/services',
    MAIL: '/mail',
    LOCALS_SERVICES: '/locals-services',
    FALE_CONOSCO: '/fale-conosco',
    DENTISTS_SERVICES: '/dentists-services',
    CONSULTA: '/consulta'
  }
};

export default API_CONFIG;
