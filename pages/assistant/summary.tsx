import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePerlaVerde } from "../../lib/hooks/usePerlaVerde";
import { PerlaVerdeClient } from "../../lib/contracts/client";
import AssistantHeader from "../../components/AssistantHeader";

export default function SummaryPage() {
  const router = useRouter();
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { mintForDelivery, isConnected } = usePerlaVerde();
  
  const material = (router.query.material as string) || "Papel";
  const weightRaw = (router.query.weight as string) || "0,00";
  const weightKg = useMemo(() => {
    const n = Number((weightRaw || "0").replace(",", "."));
    return Number.isFinite(n) ? Number(n.toFixed(3)) : 0;
  }, [weightRaw]);

  const [loading, setLoading] = useState(false);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [awardedPlv, setAwardedPlv] = useState<number | null>(null);
  const [mintingTokens, setMintingTokens] = useState(false);
  const draftId = (router.query.draftId as string) || null;

  // Obtener wallet del usuario
  const userWallet = useMemo(() => {
    return wallets.find(wallet => wallet.walletClientType === 'privy');
  }, [wallets]);

  const confirmDelivery = async () => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await fetch("/api/deliveries/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: `${router.query.docType || "CC"}-${router.query.doc || "0000"}`,
          assistantUserId: "assistant-1",
          ambitecaId: "ambiteca-1",
          items: [{ materialId: material, weightKg: weightKg }],
          draftId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error registrando entrega");
      setDeliveryId(data.deliveryId);
      setAwardedPlv(data.awardedPlv);
      toast.success("Entrega confirmada");
      if (data.deletedDraft) {
        toast.success("Borrador eliminado");
      }
      return data;
    } catch (e: any) {
      toast.error(e.message || "No se pudo confirmar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mintear tokens PPV en blockchain
  const mintTokensOnChain = async (plvAmount: number, deliveryIdStr: string) => {
    if (!authenticated || !userWallet || !isConnected) {
      toast.error('Wallet no conectada');
      return false;
    }

    try {
      setMintingTokens(true);
      
      // Convertir PLV a wei (18 decimales)
      const amountWei = PerlaVerdeClient.parseTokens(plvAmount.toString());
      
      const result = await mintForDelivery({
        to: userWallet.address,
        amount: amountWei,
        deliveryId: deliveryIdStr,
      });

      if (result) {
        toast.success('¡Tokens PPV minteados exitosamente!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Error al mintear tokens PPV');
      return false;
    } finally {
      setMintingTokens(false);
    }
  };

  const done = async () => {
    let plv = awardedPlv;
    let currentDeliveryId = deliveryId;
    
    // Confirmar entrega si no está confirmada
    if (plv == null) {
      const data = await confirmDelivery();
      if (!data) return;
      plv = data.awardedPlv;
      currentDeliveryId = data.deliveryId;
    }

    // Mintear tokens en blockchain si el usuario está autenticado
    if (authenticated && userWallet && isConnected && plv && plv > 0 && currentDeliveryId) {
      const success = await mintTokensOnChain(plv, currentDeliveryId);
      if (!success) {
        // Continuar aunque falle el minting, pero mostrar advertencia
        toast('Entrega registrada, pero no se pudieron mintear los tokens PPV', {
          icon: '⚠️',
          duration: 5000,
        });
      }
    }
    
    router.push({ 
      pathname: "/assistant/more", 
      query: { 
        ...router.query, 
        deliveryId: currentDeliveryId || "", 
        plv: plv ?? 0 
      } 
    });
  };

  return (
    <>
      <Head>
        <title>Registro listo</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-12">
        <AssistantHeader />

        <section className="max-w-5xl mx-auto mt-14 text-center">
          {deliveryId ? (
            <div className="mb-6 text-left bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Entrega confirmada. ID: {deliveryId}</p>
                <span className="text-xs font-semibold rounded-full bg-green-600 text-white px-3 py-1">Confirmado</span>
              </div>
            </div>
          ) : null}
          {draftId && !deliveryId ? (
            <div className="mb-6 text-left bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Borrador sin confirmar (ID: {draftId}). Revisa y confirma para acreditar PLV.</p>
                <button
                  onClick={() => router.push({ pathname: "/assistant/weight", query: { ...router.query } })}
                  className="text-sm rounded-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2"
                >
                  Editar peso
                </button>
              </div>
            </div>
          ) : null}
          <h1 className="text-4xl font-extrabold">¡Listo! Tu material ha sido registrado.</h1>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-lg p-8">
              <p className="font-bold text-xl">Peso</p>
              <p className="text-4xl mt-4">{weightKg.toFixed(2)}</p>
              <p className="mt-2">kg</p>
            </div>
            <div className="bg-gray-200 rounded-lg p-8">
              <p className="font-bold text-xl">Equivalente</p>
              <p className="text-4xl mt-4">{awardedPlv != null ? awardedPlv.toFixed(3) : "—"}</p>
              <p className="mt-2">Perla Verde</p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-left mt-8 text-sm">
            <p>Material: {material}</p>
            <p>Peso kg: {weightKg.toFixed(2)}</p>
            <p>Puntos Perla Verde: {awardedPlv != null ? awardedPlv.toFixed(3) : "—"}</p>
            {deliveryId ? <p>ID de entrega: {deliveryId}</p> : null}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-full bg-orange-600 text-white px-6 py-3 font-semibold" onClick={() => router.back()}>Volver a pesar</button>
            <button 
              onClick={done} 
              disabled={loading || mintingTokens} 
              className="rounded-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 font-semibold disabled:opacity-60 flex items-center gap-2"
            >
              {loading && "Registrando…"}
              {mintingTokens && (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Minteando PPV...
                </>
              )}
              {!loading && !mintingTokens && "Aceptar"}
            </button>
          </div>
          
          {/* Información sobre el minting */}
          {authenticated && userWallet && (
            <div className="mt-6 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">ℹ</span>
                </span>
                Los tokens PPV se mintearán automáticamente en tu wallet: {userWallet.address.slice(0, 6)}...{userWallet.address.slice(-4)}
              </p>
            </div>
          )}
          
          {!authenticated && (
            <div className="mt-6 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p>Para recibir tokens PPV automáticamente, inicia sesión con tu cuenta.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}


