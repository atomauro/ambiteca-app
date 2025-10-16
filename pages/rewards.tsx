import Head from "next/head";
import AssistantHeader from "@/components/AssistantHeader";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePerlaVerde } from "@/lib/hooks/usePerlaVerde";
import toast from "react-hot-toast";

export default function CitizenRewardsPage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { balance, refreshBalance, isConnected } = usePerlaVerde();
  const userWallet = wallets.find(w => w.walletClientType === 'privy');

  return (
    <>
      <Head>
        <title>Recompensas</title>
      </Head>
      <main className="min-h-screen bg-background">
        <AssistantHeader showBackButton={false} />

        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10">Tus PPV y recompensas</h1>

          {!authenticated ? (
            <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">Inicia sesión para ver tus tokens PPV</h2>
              <p className="text-yellow-600 mb-6">Conecta tu wallet para ver tu balance y gestionar tus tokens PerlaVerde.</p>
              <button onClick={login} className="rounded-full bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold">Iniciar sesión</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tu Balance PPV</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold">{balance ? parseFloat(balance).toFixed(2) : '0.00'}</span>
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
                    <button onClick={refreshBalance} className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors" title="Actualizar balance">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Catálogo (pronto)</h3>
                <p className="text-gray-500 text-center py-8">El catálogo de recompensas estará disponible próximamente</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}


