import Head from "next/head";
import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePerlaVerde } from "../../lib/hooks/usePerlaVerde";
import { PerlaVerdeClient } from "../../lib/contracts/client";
import AssistantHeader from "../../components/AssistantHeader";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function RewardsPage() {
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { balance, transfer, refreshBalance, isConnected, userAddress } = usePerlaVerde();
  
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const userWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(transferAmount) <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (!balance || parseFloat(transferAmount) > parseFloat(balance)) {
      toast.error('Saldo insuficiente');
      return;
    }

    setIsTransferring(true);
    try {
      const result = await transfer(transferTo, transferAmount);
      if (result) {
        toast.success('Transferencia exitosa!');
        setTransferTo('');
        setTransferAmount('');
        setShowTransferForm(false);
      }
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de puntos y recompensas</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10">Gestión de puntos PPV y recompensas</h1>
          
          {!authenticated ? (
            <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">Inicia sesión para ver tus tokens PPV</h2>
              <p className="text-yellow-600 mb-6">Conecta tu wallet para ver tu balance y gestionar tus tokens PerlaVerde.</p>
              <button 
                onClick={login}
                className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold"
              >
                Iniciar sesión
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Balance Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tu Balance PPV</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold">
                        {balance ? parseFloat(balance).toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xl">PPV</span>
                    </div>
                    {userWallet && (
                      <div className="text-green-100 text-sm mt-2 flex items-center gap-2">
                        <span>Wallet: {userWallet.address.slice(0, 8)}...{userWallet.address.slice(-6)}</span>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(userWallet.address).then(()=>toast.success('Wallet copiada')); }}
                          className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white"
                        >
                          Copiar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={refreshBalance}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                      title="Actualizar balance"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setShowTransferForm(!showTransferForm)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-left transition-colors"
                >
                  <h3 className="text-xl font-bold mb-2">Transferir PPV</h3>
                  <p className="text-blue-100">Envía tokens a otra dirección</p>
                </button>
                
                <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-left transition-colors">
                  <h3 className="text-xl font-bold mb-2">Canjear Recompensas</h3>
                  <p className="text-purple-100">Próximamente disponible</p>
                </button>
              </div>

              {/* Transfer Form */}
              {showTransferForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Transferir Tokens PPV</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección de destino
                      </label>
                      <input
                        type="text"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad PPV
                      </label>
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={balance || '0'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {balance && (
                        <p className="text-sm text-gray-500 mt-1">
                          Balance disponible: {parseFloat(balance).toFixed(2)} PPV
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleTransfer}
                        disabled={isTransferring || !isConnected}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md py-2 px-4 font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        {isTransferring && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {isTransferring ? 'Transfiriendo...' : 'Transferir'}
                      </button>
                      <button
                        onClick={() => setShowTransferForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction History Placeholder */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Historial de Transacciones</h3>
                <p className="text-gray-500 text-center py-8">
                  El historial de transacciones estará disponible próximamente
                </p>
              </div>
            </div>
          )}
          <div className="mt-10 text-center">
            <button onClick={() => router.back()} className="rounded-full border px-6 py-2 text-sm hover:bg-muted">Volver</button>
          </div>
        </section>
      </main>
    </>
  );
}


