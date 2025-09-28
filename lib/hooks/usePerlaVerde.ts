import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { PerlaVerdeClient, type MintForDeliveryParams, type TransactionResult } from '../contracts/client';
import { getContractConfig, DEFAULT_CHAIN_ID, type SupportedChainId } from '../contracts/config';
import toast from 'react-hot-toast';

interface UsePerlaVerdeState {
  client: PerlaVerdeClient | null;
  isLoading: boolean;
  error: string | null;
  balance: string | null;
  isConnected: boolean;
  userAddress: string | null;
  chainId: SupportedChainId;
}

interface UsePerlaVerdeActions {
  mintForDelivery: (params: MintForDeliveryParams) => Promise<TransactionResult | null>;
  transfer: (to: string, amount: string) => Promise<TransactionResult | null>;
  refreshBalance: () => Promise<void>;
  switchChain: (chainId: SupportedChainId) => Promise<void>;
}

export function usePerlaVerde(targetChainId: SupportedChainId = DEFAULT_CHAIN_ID): UsePerlaVerdeState & UsePerlaVerdeActions {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  
  const [state, setState] = useState<UsePerlaVerdeState>({
    client: null,
    isLoading: true,
    error: null,
    balance: null,
    isConnected: false,
    userAddress: null,
    chainId: targetChainId,
  });

  // Obtener la wallet embebida de Privy
  const embeddedWallet = useMemo(() => {
    return wallets.find(wallet => wallet.walletClientType === 'privy');
  }, [wallets]);

  // Inicializar cliente del contrato
  const initializeClient = useCallback(async () => {
    if (!ready || !authenticated || !embeddedWallet) {
      setState(prev => ({ 
        ...prev, 
        client: null, 
        isLoading: false, 
        isConnected: false,
        userAddress: null 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Obtener el provider de la wallet embebida
      const eip1193Provider = await embeddedWallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(eip1193Provider);
      const signer = await provider.getSigner();
      
      // Verificar que estamos en la red correcta
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      if (currentChainId !== targetChainId) {
        // Intentar cambiar de red
        try {
          await embeddedWallet.switchChain(targetChainId);
        } catch (switchError) {
          console.error('Error switching chain:', switchError);
          setState(prev => ({ 
            ...prev, 
            error: `Por favor cambia a ${getContractConfig(targetChainId).CHAIN_NAME}`,
            isLoading: false 
          }));
          return;
        }
      }

      // Crear cliente del contrato
      const client = new PerlaVerdeClient(signer, targetChainId);
      const userAddress = await signer.getAddress();

      setState(prev => ({
        ...prev,
        client,
        isConnected: true,
        userAddress,
        chainId: targetChainId,
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error initializing PerlaVerde client:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false,
        isConnected: false,
      }));
    }
  }, [ready, authenticated, embeddedWallet, targetChainId]);

  // Refrescar balance
  const refreshBalance = useCallback(async () => {
    if (!state.client || !state.userAddress) return;

    try {
      const balanceWei = await state.client.getBalance(state.userAddress);
      const balanceFormatted = PerlaVerdeClient.formatTokens(balanceWei);
      
      setState(prev => ({ ...prev, balance: balanceFormatted }));
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Error al obtener el balance');
    }
  }, [state.client, state.userAddress]);

  // Mint tokens para entrega
  const mintForDelivery = useCallback(async (params: MintForDeliveryParams): Promise<TransactionResult | null> => {
    if (!state.client) {
      toast.error('Cliente no inicializado');
      return null;
    }

    try {
      toast.loading('Procesando transacción...', { id: 'mint-delivery' });
      
      const result = await state.client.mintForDelivery(params);
      
      toast.success('Tokens minteados exitosamente!', { id: 'mint-delivery' });
      
      // Refrescar balance después de un delay
      setTimeout(() => {
        refreshBalance();
      }, 2000);
      
      return result;
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Error al mintear tokens', { id: 'mint-delivery' });
      return null;
    }
  }, [state.client, refreshBalance]);

  // Transferir tokens
  const transfer = useCallback(async (to: string, amount: string): Promise<TransactionResult | null> => {
    if (!state.client) {
      toast.error('Cliente no inicializado');
      return null;
    }

    try {
      toast.loading('Procesando transferencia...', { id: 'transfer' });
      
      const amountWei = PerlaVerdeClient.parseTokens(amount);
      const result = await state.client.transfer(to, amountWei);
      
      toast.success('Transferencia exitosa!', { id: 'transfer' });
      
      // Refrescar balance después de un delay
      setTimeout(() => {
        refreshBalance();
      }, 2000);
      
      return result;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      toast.error('Error en la transferencia', { id: 'transfer' });
      return null;
    }
  }, [state.client, refreshBalance]);

  // Cambiar de red
  const switchChain = useCallback(async (chainId: SupportedChainId) => {
    if (!embeddedWallet) {
      toast.error('Wallet no disponible');
      return;
    }

    try {
      await embeddedWallet.switchChain(chainId);
      setState(prev => ({ ...prev, chainId }));
      // Re-inicializar cliente con nueva red
      await initializeClient();
    } catch (error) {
      console.error('Error switching chain:', error);
      toast.error('Error al cambiar de red');
    }
  }, [embeddedWallet, initializeClient]);

  // Efectos
  useEffect(() => {
    initializeClient();
  }, [initializeClient]);

  useEffect(() => {
    if (state.isConnected && state.userAddress) {
      refreshBalance();
    }
  }, [state.isConnected, state.userAddress, refreshBalance]);

  return {
    ...state,
    mintForDelivery,
    transfer,
    refreshBalance,
    switchChain,
  };
}
