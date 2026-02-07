import React, { useEffect, useState } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, TrendingUp, Package } from 'lucide-react';
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

interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  trialEndsAt: string;
  subscription: {
    status: string;
    currentPeriodEnd: string;
    plan: Plan;
    payments: Payment[];
  };
  _count: {
    users: number;
    products: number;
    orders: number;
    departments: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
}

const BillingPage: React.FC = () => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tenantRes, plansRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/tenant/info`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tenant/plans`)
      ]);

      setTenantInfo(tenantRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      TRIAL: 'Trial',
      ACTIVE: 'Ativo',
      PAST_DUE: 'Pagamento Pendente',
      CANCELED: 'Cancelado',
      EXPIRED: 'Expirado'
    };
    return map[status] || status;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateUsagePercent = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar informações da conta</p>
      </div>
    );
  }

  const { subscription, _count } = tenantInfo;
  const currentPlan = subscription.plan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planos e Billing</h1>
        <p className="text-gray-600">Gerencie sua assinatura e pagamentos</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Assinatura Atual</h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(subscription.status)}`}>
                {getStatusText(subscription.status)}
              </span>
              <span className="text-2xl font-bold">{currentPlan.name}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              R$ {currentPlan.price}
            </p>
            <p className="text-sm text-gray-600">/mês</p>
          </div>
        </div>

        {/* Trial Warning */}
        {subscription.status === 'TRIAL' && tenantInfo.trialEndsAt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Período de Trial</p>
              <p className="text-sm text-blue-800">
                Seu trial gratuito termina em {formatDate(tenantInfo.trialEndsAt)}.
                Adicione um método de pagamento para continuar usando após o período de trial.
              </p>
            </div>
          </div>
        )}

        {/* Payment Due Warning */}
        {subscription.status === 'PAST_DUE' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Pagamento Pendente</p>
              <p className="text-sm text-yellow-800">
                Atualize suas informações de pagamento para continuar usando o sistema.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Renovação</p>
              <p className="font-semibold">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
            <div>
              <p className="text-gray-600">Subdomínio</p>
              <p className="font-semibold">{tenantInfo.subdomain}.sistema.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Uso do Plano
        </h2>

        <div className="space-y-6">
          {/* Users */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Usuários</span>
              <span className="text-sm text-gray-600">
                {_count.users} / {currentPlan.maxUsers}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${calculateUsagePercent(_count.users, currentPlan.maxUsers)}%` }}
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Produtos</span>
              <span className="text-sm text-gray-600">
                {_count.products} / {currentPlan.maxProducts}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${calculateUsagePercent(_count.products, currentPlan.maxProducts)}%` }}
              />
            </div>
          </div>

          {/* Orders */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Pedidos (mês atual)</span>
              <span className="text-sm text-gray-600">
                {_count.orders} / {currentPlan.maxOrders}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${calculateUsagePercent(_count.orders, currentPlan.maxOrders)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Planos Disponíveis
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-xl p-6 ${
                plan.id === currentPlan.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.id === currentPlan.id && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Atual
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">R$ {plan.price}</span>
                <span className="text-gray-600">/mês</span>
              </div>

              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Até {plan.maxUsers} usuários</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{plan.maxProducts} produtos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{plan.maxOrders} pedidos/mês</span>
                </li>
                {plan.features.api_access && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Acesso à API</span>
                  </li>
                )}
                {plan.features.custom_domain && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Domínio customizado</span>
                  </li>
                )}
              </ul>

              {plan.id !== currentPlan.id && (
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                  {plan.price > currentPlan.price ? 'Fazer Upgrade' : 'Mudar Plano'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {subscription.payments && subscription.payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Pagamentos
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscription.payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm">
                      {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      R$ {payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'PAID' ? 'Pago' : payment.status === 'PENDING' ? 'Pendente' : 'Falhou'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
