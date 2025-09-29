import Head from 'next/head'
import { usePrivy } from '@privy-io/react-auth'
import { useUserSync } from '@/lib/hooks/useUserSync'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Recycle } from 'lucide-react'
import { getRoleLabel } from '@/lib/utils-client'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { Pencil, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'

export default function ProfilePage() {
  const { user, logout, getAccessToken } = usePrivy()
  const { userProfile, refreshProfile } = useUserSync()

  const displayName = userProfile?.full_name || user?.google?.name || 'Usuario'
  const email = userProfile?.email || user?.email?.address || ''
  const avatar = (user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || '/images/avatar.png'
  const [displayAvatar, setDisplayAvatar] = useState(avatar)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    doc_type: 'CC',
    doc_number: '',
    address: '',
    birth_date: '',
    avatar_url: avatar,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.full_name && form.full_name.trim().length > 0 && form.full_name.trim().length < 3) e.full_name = 'Mínimo 3 caracteres'
    if (form.phone && !isValidPhoneNumber(form.phone)) e.phone = 'Teléfono inválido'
    // Todos los campos son opcionales; doc_number solo valida si viene
    if (form.doc_number && form.doc_number.trim().length < 5) e.doc_number = 'Documento inválido'
    if (form.birth_date && isNaN(Date.parse(form.birth_date))) e.birth_date = 'Fecha inválida'
    // avatar_url opcional; permitir rutas relativas o URLs firmadas
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      try {
        const { toast } = await import('@/components/ui/use-toast')
        toast({ title: 'Revisa el formulario', description: '' })
      } catch {}
      return
    }
    try {
      setSaving(true)
      // toast loader
      const { toast } = await import('@/components/ui/use-toast')
      const t = toast({
        title: (
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>Guardando…</span>
          </div>
        ),
        description: 'Aplicando cambios',
        duration: 1000000,
      })
      const token = await getAccessToken()
      const resp = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        t.dismiss()
        toast({
          title: (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="size-4" />
              <span>Error</span>
            </div>
          ),
          description: err.error || 'No se pudo guardar',
        })
        throw new Error(err.error || 'No se pudo guardar')
      }
      t.dismiss()
      toast({
        title: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="size-4" />
            <span>Listo</span>
          </div>
        ),
        description: 'Perfil actualizado',
      })
      try {
        const refreshed = await refreshProfile()
        if (refreshed?.full_name) {
          setForm(prev => ({ ...prev, full_name: refreshed.full_name }))
        }
      } catch {}
      // opcional: refrescar perfil desde hook
    } catch (err) {
      console.error('Save profile error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>Perfil - AMBITECA</title>
      </Head>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Volver</Link>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  {React.createElement(Recycle, { className: 'h-5 w-5 text-primary-foreground' })}
                </div>
                <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
              </div>
            </div>

           {/*  <nav className="hidden md:flex items-center gap-6">
              <a href="/#inicio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Inicio</a>
              <a href="/#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
              <a href="/#materiales" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Materiales</a>
            </nav> */}

            <div className="flex items-center gap-4">
              {/* <nav className="hidden sm:flex items-center gap-2">
                <Link href="/assistant" className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">Asistente</Link>
                <Link href="/admin" className="px-3 py-1 text-sm rounded-md hover:bg-gray-100 transition-colors">Admin</Link>
              </nav> */}
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                  <Avatar className="size-8">
                    <AvatarImage src={(user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || '/images/avatar.png'} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={(user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || '/images/avatar.png'} alt={displayName} />
                        <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium leading-none">{displayName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[160px]">{email}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile"><DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem></Link>
                {/*   <Link href="/assistant"><DropdownMenuItem className="cursor-pointer">Asistente</DropdownMenuItem></Link>
                  <Link href="/admin"><DropdownMenuItem className="cursor-pointer">Admin</DropdownMenuItem></Link> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={async () => { try { await logout(); window.location.href = '/'; } catch(e) { console.error(e);} }}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="size-28">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 grid place-items-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Cambiar imagen de perfil"
                title="Cambiar imagen de perfil"
              >
                <Pencil className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const token = await getAccessToken()
                    const resp = await fetch('/api/profile/sign-avatar-upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                      body: JSON.stringify({ fileName: file.name })
                    })
                    if (!resp.ok) throw new Error('No se pudo preparar la subida')
                    const { uploadUrl, publicUrl } = await resp.json()
                    const { toast } = await import('@/components/ui/use-toast')
                    const t = toast({
                      title: (
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Subiendo…</span>
                        </div>
                      ),
                      description: file.name,
                      duration: 1000000,
                    })
                    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
                    setDisplayAvatar(publicUrl)
                    setForm(prev => ({ ...prev, avatar_url: publicUrl }))
                    t.dismiss()
                    toast({
                      title: (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="size-4" />
                          <span>Listo</span>
                        </div>
                      ),
                      description: 'Imagen actualizada',
                    })
                  } catch (err) {
                    console.error('Upload avatar error:', err)
                  } finally {
                    // resetear input para permitir la misma imagen
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="sm:hidden">
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm border hover:bg-muted">Ir al dashboard</Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6 items-start">
            {/* Sidebar */}
            <aside className="border rounded-lg p-4 text-sm">
              <div className="font-medium mb-2">Menú</div>
              <nav className="grid gap-1">
                <a className="px-2 py-1 rounded hover:bg-muted cursor-default">Perfil</a>
                <a className="px-2 py-1 rounded hover:bg-muted cursor-not-allowed opacity-50">Seguridad (pronto)</a>
                <a className="px-2 py-1 rounded hover:bg-muted cursor-not-allowed opacity-50">Notificaciones (pronto)</a>
              </nav>
            </aside>

            {/* Content */}
            <section className="grid gap-6">
              <form onSubmit={onSubmit} className="border rounded-lg p-6 grid gap-4">
                <h2 className="font-medium">Información de perfil</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <label className="text-sm text-muted-foreground">Nombre completo</label>
                    <input name="full_name" value={form.full_name} onChange={onChange} className="border rounded px-3 py-2 text-sm" />
                    {errors.full_name && <span className="text-xs text-red-600">{errors.full_name}</span>}
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm text-muted-foreground">Teléfono</label>
                    <div className="border rounded px-2 py-1.5 text-sm">
                      <PhoneInput
                        international
                        defaultCountry="CO"
                        value={form.phone || undefined}
                        onChange={(value) => setForm(prev => ({ ...prev, phone: value || '' }))}
                        className="[&>input]:outline-none"
                      />
                    </div>
                    {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm text-muted-foreground">Tipo de documento</label>
                    <select name="doc_type" value={form.doc_type} onChange={onChange} className="border rounded px-3 py-2 text-sm">
                      <option value="CC">CC</option>
                      <option value="TI">TI</option>
                      <option value="PP">PP</option>
                      <option value="CE">CE</option>
                      <option value="NIT">NIT</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm text-muted-foreground">Número de documento</label>
                    <input name="doc_number" value={form.doc_number} onChange={onChange} className="border rounded px-3 py-2 text-sm" />
                    {errors.doc_number && <span className="text-xs text-red-600">{errors.doc_number}</span>}
                  </div>
                  <div className="grid gap-1 sm:col-span-2">
                    <label className="text-sm text-muted-foreground">Dirección</label>
                    <input name="address" value={form.address} onChange={onChange} className="border rounded px-3 py-2 text-sm" />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm text-muted-foreground">Fecha de nacimiento</label>
                    <input type="date" name="birth_date" value={form.birth_date} onChange={onChange} className="border rounded px-3 py-2 text-sm" />
                    {errors.birth_date && <span className="text-xs text-red-600">{errors.birth_date}</span>}
                  </div>
                  {/* Campo oculto para mantener el valor en el submit */}
                  <input type="hidden" name="avatar_url" value={form.avatar_url} />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={saving} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50 inline-flex items-center gap-2">
                    {saving && <Loader2 className="size-4 animate-spin" />}
                    <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
                  </button>
                </div>
              </form>

              <div className="border rounded-lg p-6">
                <h2 className="font-medium">Resumen</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rol</div>
                    <div className="font-medium">{getRoleLabel(userProfile?.role)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Wallet principal</div>
                    <div className="font-medium break-all">{userProfile?.primary_wallet_address || '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Balance PLV</div>
                    <div className="font-medium">{userProfile?.plv_balance ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium break-all">{(userProfile?.email || email) || ''}</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}


