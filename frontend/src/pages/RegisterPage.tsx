import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Check, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  features: any;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    subdomain: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    planId: ''
  });

  // Validations
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar planos
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tenant/plans`);
      setPlans(response.data);
      
      // Selecionar plano Pro por padrão
      const proPlan = response.data.find((p: Plan) => p.name === 'Pro');
      if (proPlan) {
        setFormData(prev => ({ ...prev, planId: proPlan.id }));
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  // Verificar disponibilidade do subdomínio
  useEffect(() => {
    const checkSubdomain = async () => {
      if (!formData.subdomain || formData.subdomain.length < 3) {
        setSubdomainAvailable(null);
        return;
      }

      setSubdomainChecking(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tenant/check-subdomain/${formData.subdomain}`
        );
        setSubdomainAvailable(response.data.available);
      } catch (error) {
        setSubdomainAvailable(false);
      } finally {
        setSubdomainChecking(false);
      }
    };

    const timer = setTimeout(checkSubdomain, 500);
    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Normalizar subdomínio
    if (name === 'subdomain') {
      const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: normalized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    }

    if (!formData.subdomain) {
      newErrors.subdomain = 'Subdomínio é obrigatório';
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'Mínimo 3 caracteres';
    } else if (!subdomainAvailable) {
      newErrors.subdomain = 'Este subdomínio não está disponível';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.adminName) {
      newErrors.adminName = 'Nome é obrigatório';
    }

    if (!formData.adminEmail) {
      newErrors.adminEmail = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email inválido';
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Senha é obrigatória';
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Mínimo 6 caracteres';
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!formData.planId) {
      alert('Selecione um plano');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tenant/register`,
        formData
      );

      // Mostrar mensagem de sucesso
      alert(`Conta criada com sucesso! Acesse: ${formData.subdomain}.sistema.com`);
      
      // Redirecionar para login
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Criar Conta SaaS</h1>
              <p className="text-blue-100">Comece seu trial gratuito de 14 dias</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-white' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Empresa */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Informações da Empresa</h2>
                <p className="text-gray-600">Configure sua empresa no sistema</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Minha Empresa Ltda"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subdomínio</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleChange}
                      placeholder="minhaempresa"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.subdomain ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {subdomainChecking && (
                      <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!subdomainChecking && subdomainAvailable === true && (
                      <Check className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                    )}
                    {!subdomainChecking && subdomainAvailable === false && (
                      <X className="absolute right-3 top-3.5 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <span className="text-gray-600">.sistema.com</span>
                </div>
                {errors.subdomain && (
                  <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
                )}
                {!errors.subdomain && formData.subdomain && subdomainAvailable && (
                  <p className="text-green-600 text-sm mt-1">✓ Subdomínio disponível!</p>
                )}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                Continuar <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Administrador */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Administrador</h2>
                <p className="text-gray-600">Crie sua conta de administrador</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="João Silva"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.adminName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.adminName && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="joao@empresa.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.adminEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.adminEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.adminPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Planos */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Escolha seu Plano</h2>
                <p className="text-gray-600">14 dias grátis, cancele quando quiser</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setFormData(prev => ({ ...prev, planId: plan.id }))}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      formData.planId === plan.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {plan.name === 'Pro' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Sparkles className="w-4 h-4" /> Mais Popular
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">R$ {plan.price}</span>
                      <span className="text-gray-600">/mês</span>
                    </div>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Até {plan.maxUsers} usuários</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{plan.maxProducts} produtos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{plan.maxOrders} pedidos/mês</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          {typeof plan.features.marketplace_integrations === 'number'
                            ? `${plan.features.marketplace_integrations} integrações`
                            : 'Integrações ilimitadas'}
                        </span>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.planId}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Começar Trial Grátis
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Ao criar sua conta, você concorda com nossos{' '}
                <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            Fazer login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
