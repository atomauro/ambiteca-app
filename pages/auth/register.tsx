import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSupabase } from "../../components/SupabaseProvider";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AuthRegister() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!agree) {
      toast.error("Debes aceptar los términos para continuar");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Ingresa un correo válido");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Cuenta creada. Revisa tu correo si es necesario.");
    } catch (e: any) {
      toast.error(e.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Crear cuenta</title>
      </Head>
      <main className="min-h-screen bg-gray-100">
        <header className="flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-3">
            <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={32} height={32} />
            <span className="font-semibold">AMBITECAPP</span>
          </div>
          <Link href="/" className="text-sm underline">Volver al inicio</Link>
        </header>

        <section className="grid sm:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <div className="order-2 sm:order-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              Reciclar nunca fue tan fácil ni tan útil.
            </h1>
          </div>
          <div className="order-1 sm:order-2 bg-white rounded-lg shadow p-5 sm:p-6">
            <h2 className="text-xl font-bold text-center">Crea una cuenta gratuita</h2>
            <div className="mt-5 space-y-3">
              <button className="w-full border rounded-md py-2 flex items-center justify-center gap-3">
                <FcGoogle size={20} />
                <span>Continuar con Google</span>
              </button>
              <button className="w-full border rounded-md py-2 flex items-center justify-center gap-3">
                <FaApple size={20} />
                <span>Continuar con Apple</span>
              </button>
              <button className="w-full border rounded-md py-2 flex items-center justify-center gap-3">
                <FaFacebook size={20} className="text-[#1877F2]" />
                <span>Continuar con Facebook</span>
              </button>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <label className="block font-semibold">Correo electrónico</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" inputMode="email" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <label className="block font-semibold">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-md border px-3 py-2" />
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded" />
              <span>Acepto recibir consejos, tendencias, actualizaciones y ofertas.</span>
            </label>

            <button onClick={signUp} disabled={loading || !agree} className="mt-5 w-full rounded-md bg-green-600 hover:bg-green-700 text-white py-2 font-semibold disabled:opacity-60">
              {loading ? "Creando…" : "Crear cuenta"}
            </button>

            <p className="mt-4 text-center text-sm">
              ¿Ya tienes cuenta? <Link href="/auth/login" className="underline">Iniciar sesión</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}


