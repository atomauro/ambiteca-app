import { usePerlaVerde } from '../lib/hooks/usePerlaVerde';
import { DEFAULT_CHAIN_ID, type SupportedChainId } from '../lib/contracts/config';
import { usePrivy } from '@privy-io/react-auth';

interface PerlaVerdeBalanceProps {
  className?: string;
  showFullBalance?: boolean;
  chainId?: SupportedChainId;
}

export default function PerlaVerdeBalance({ 
  className = '', 
  showFullBalance = false,
  chainId = DEFAULT_CHAIN_ID 
}: PerlaVerdeBalanceProps) {
  const { authenticated } = usePrivy();
  const { balance, isLoading, error, isConnected, refreshBalance } = usePerlaVerde(chainId);

  if (!authenticated) {
    return null;
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        Error: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Cargando balance...</span>
      </div>
    );
  }

  if (!isConnected || balance === null) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Balance no disponible
      </div>
    );
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (showFullBalance) {
      return num.toLocaleString('es-CO', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 6 
      });
    }
    
    // Mostrar versión compacta
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toFixed(2);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        <span className="font-semibold text-green-700">
          {formatBalance(balance)} PPV
        </span>
      </div>
      
      <button
        onClick={refreshBalance}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="Actualizar balance"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}
