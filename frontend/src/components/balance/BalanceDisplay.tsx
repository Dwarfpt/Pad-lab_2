import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import { Wallet } from 'lucide-react';

export default function BalanceDisplay() {
  const { formatPrice } = usePriceFormatter();
  
  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await api.get('/balance/balance');
      return res.data;
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
        <Wallet className="w-4 h-4 inline mr-1" />
        <span className="animate-pulse">...</span>
      </div>
    );
  }

  const balance = balanceData?.balance || 0;
  
  return (
    <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
      <Wallet className="w-4 h-4 inline mr-1" />
      {formatPrice(balance)}
    </div>
  );
}
