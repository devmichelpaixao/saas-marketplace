import { useState, useEffect } from 'react';
import api from '../services/api';

interface Integration {
  id: string;
  marketplace: string;
  active: boolean;
  expiresAt: string;
}

interface ConfigFormData {
  marketplace: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState('');
  const [configForm, setConfigForm] = useState<ConfigFormData>({
    marketplace: '',
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await api.get('/marketplace/integrations');
      setIntegrations(response.data);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    }
  };

  const openConfigModal = (marketplace: string) => {
    setSelectedMarketplace(marketplace);
    setConfigForm({
      marketplace,
      clientId: '',
      clientSecret: '',
      redirectUri: `http://localhost:3000/api/marketplace/${marketplace.toLowerCase()}/callback`
    });
    setShowConfigModal(true);
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await api.post('/marketplace/config', configForm);
      alert('Configuração salva com sucesso! Agora você pode conectar.');
      setShowConfigModal(false);
      initiateOAuth(selectedMarketplace);
    } catch (error) {
      alert('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuth = (marketplace: string) => {
    if (marketplace === 'MERCADO_LIVRE') {
      window.location.href = '/api/marketplace/mercadolivre/auth';
    } else if (marketplace === 'SHOPEE') {
      window.location.href = '/api/marketplace/shopee/auth';
    }
  };

  const isConnected = (marketplace: string) => {
    return integrations.some(i => i.marketplace === marketplace && i.active);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Integrações</h1>
      
      {/* Cards de Integrações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Mercado Livre */}
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 text-lg">Mercado Livre</h3>
                {isConnected('MERCADO_LIVRE') && (
                  <span className="text-xs text-green-600 font-medium">● Conectado</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Conecte sua conta do Mercado Livre para sincronizar produtos, pedidos e estoque automaticamente
            </p>
            <button 
              onClick={() => openConfigModal('MERCADO_LIVRE')}
              className={`btn w-full ${isConnected('MERCADO_LIVRE') ? 'btn-secondary' : 'btn-primary'}`}
            >
              {isConnected('MERCADO_LIVRE') ? 'Reconfigurar' : 'Configurar e Conectar'}
            </button>
          </div>
        </div>
        
        {/* Shopee */}
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 text-lg">Shopee</h3>
                {isConnected('SHOPEE') && (
                  <span className="text-xs text-green-600 font-medium">● Conectado</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Conecte sua loja na Shopee para gerenciar vendas, estoque e entregas em um só lugar
            </p>
            <button 
              onClick={() => openConfigModal('SHOPEE')}
              className={`btn w-full ${isConnected('SHOPEE') ? 'btn-secondary' : 'btn-primary'}`}
            >
              {isConnected('SHOPEE') ? 'Reconfigurar' : 'Configurar e Conectar'}
            </button>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          Como obter as credenciais
        </h3>
        <div className="space-y-4 text-sm text-blue-900">
          <div>
            <h4 className="font-medium mb-2">📦 Mercado Livre:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Acesse <a href="https://developers.mercadolivre.com.br/" target="_blank" className="underline text-blue-700">developers.mercadolivre.com.br</a></li>
              <li>Faça login e vá em "Minhas aplicações" → "Criar nova aplicação"</li>
              <li>Preencha os dados da aplicação</li>
              <li>Na URL de redirecionamento, use: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/api/marketplace/mercadolivre/callback</code></li>
              <li>Copie o <strong>APP_ID</strong> e <strong>SECRET_KEY</strong></li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">🛍️ Shopee:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Acesse <a href="https://open.shopee.com/" target="_blank" className="underline text-blue-700">open.shopee.com</a></li>
              <li>Registre-se como desenvolvedor/partner</li>
              <li>Crie um novo aplicativo na seção "My Apps"</li>
              <li>Configure a URL de callback: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/api/marketplace/shopee/callback</code></li>
              <li>Copie o <strong>Partner ID</strong> e <strong>Partner Key</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Modal de Configuração */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Configurar {selectedMarketplace === 'MERCADO_LIVRE' ? 'Mercado Livre' : 'Shopee'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedMarketplace === 'MERCADO_LIVRE' ? 'APP ID / Client ID' : 'Partner ID'}
                </label>
                <input
                  type="text"
                  className="input"
                  value={configForm.clientId}
                  onChange={(e) => setConfigForm({...configForm, clientId: e.target.value})}
                  placeholder="Cole aqui seu ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedMarketplace === 'MERCADO_LIVRE' ? 'Secret Key / Client Secret' : 'Partner Key'}
                </label>
                <input
                  type="password"
                  className="input"
                  value={configForm.clientSecret}
                  onChange={(e) => setConfigForm({...configForm, clientSecret: e.target.value})}
                  placeholder="Cole aqui sua chave secreta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Redirecionamento
                </label>
                <input
                  type="text"
                  className="input bg-gray-50"
                  value={configForm.redirectUri}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Configure esta URL no painel do marketplace</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveConfig}
                  className="btn btn-primary flex-1"
                  disabled={loading || !configForm.clientId || !configForm.clientSecret}
                >
                  {loading ? 'Salvando...' : 'Salvar e Conectar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
