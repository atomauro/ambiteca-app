import Head from "next/head";
import Image from "next/image";

export default function HistoryPersonDetail() {
  return (
    <>
      <Head>
        <title>Historial por persona · Detalle</title>
      </Head>
      <main className="min-h-screen bg-white px-6 sm:px-12 py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={36} height={36} />
            <span className="font-semibold tracking-wide">AMBITECAPP</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">0.0000</span>
            <span className="w-6 h-6 rounded-full bg-green-500 inline-block" />
          </div>
        </header>

        <div className="mt-4">
          <a href="/" className="text-sm underline">Volver al inicio</a>
        </div>

        <section className="max-w-5xl mx-auto mt-14">
          <h1 className="text-2xl font-extrabold">Juan Pérez</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-6 text-sm">
            <div>
              <p className="text-gray-600">Material:</p>
              <p className="font-semibold">Plástico</p>
            </div>
            <div>
              <p className="text-gray-600">Ambiteca:</p>
              <p className="font-semibold">San Luis</p>
            </div>
            <div>
              <p className="text-gray-600">Año</p>
              <p className="font-semibold">Mes</p>
            </div>
            <div>
              <p className="text-gray-600">Peso total</p>
              <p className="font-semibold">xMes</p>
            </div>
          </div>

          <div className="mt-8 w-full overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Día/mes/año</th>
                  <th className="p-3">Cant. x Peso kg/Lt</th>
                  <th className="p-3">Kilos convertidos por Token</th>
                  <th className="p-3">Valor total PPV</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">&nbsp;</td>
                    <td className="p-3">&nbsp;</td>
                    <td className="p-3">&nbsp;</td>
                    <td className="p-3">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}


