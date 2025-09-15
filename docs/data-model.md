# AMBITECA APP · Modelo de datos y flujos (Supabase + Privy)

Este documento resume el esquema de base de datos, flujos de puntos PLV y estrategias de reclamo/onchain.

## Objetivos
- Registrar entregas de material en ambitecas con asistentes.
- Asignar puntos cripto Perla Verde (PLV) por material/peso.
- Permitir a personas sin cuenta recibir un comprobante y reclamar después.
- Vincular cuenta (email/teléfono) y mostrar saldo acumulado inmediatamente.
- Opción de retiro a wallet (onchain) con gas patrocinado.

## Esquema (Postgres/Supabase)
Revisa la migración: `supabase/migrations/20250915_plv_schema.sql`.

Entidades clave:
- `profiles` (1–1 con `auth.users`, rol y enlace opcional a `persons`)
- `persons` (doc_type, doc_number, contacto, `link_code`)
- `ambitecas`, `materials`, `material_conversion_rates`
- `deliveries` y `delivery_items` (registro y detalle de pesajes)
- `plv_wallets`, `plv_transactions`, vista `v_plv_balances`
- `rewards_catalog`, `redemptions`
- `plv_claims` (retiros onchain), `erc20_transfers` (auditoría)

## Conversión a PLV
- Para cada `delivery_items` se busca tarifa vigente en `material_conversion_rates` por `material_id` y (opcional) `ambiteca_id`.
- PLV total = Σ(weight_kg × plv_per_kg).
- Se inserta `plv_transactions` credit en el wallet de la `person`.

## Reclamo y vinculación
- Al crear cuenta (Supabase/Privy), se vincula `profiles.person_id` con una `persons` existente por doc/OTP.
- El wallet lógico (offchain) permanece: el usuario ve su saldo histórico al momento.

## Retiro a onchain (opcional)
- Embedded wallet de Privy al crear cuenta.
- Al “retirar”, crear `plv_claims` y ejecutar transferencia/mint desde tesorería; registrar en `erc20_transfers` y el `debit` en `plv_transactions`.

## RLS (sugerencias)
- `profiles`: cada user solo su fila; admin total.
- `deliveries/items`: assistant limitado a su ambiteca/turno; admin total; citizen ve sus propias entregas (por `person_id` vinculada).
- `plv_wallets/transactions`: citizen ve su wallet; assistant lectura parcial; admin total.
- `material_conversion_rates`: solo admin escribe.

## Endpoint de demo
- `POST /api/plv/withdraw` (mock): valida parámetros y devuelve `claimId` y `txHash` ficticios. En producción debe:
  - Verificar ownership (token Privy customAuth),
  - Insertar `plv_claims`,
  - Ejecutar transferencia/mint onchain,
  - Insertar `erc20_transfers` y `plv_transactions` debit.

## Referencias
- Integración Supabase + Privy: [Using Supabase as an authentication provider](https://docs.privy.io/recipes/authentication/using-supabase-for-custom-auth)

## Roadmap
- RLS policies y RPC/edge functions para conversión/retiradas.
- Vistas materializadas para reportes por ambiteca/material/mes.
- Integración OAuth social con Supabase.
- OneBalance para gas patrocinado.
