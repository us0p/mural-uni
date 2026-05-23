'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Plus, Pencil, Trash2, Users, Search, Shield, Mail, Phone,
  AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api/users'
import { getRoles } from '@/lib/api/roles'
import type { UserResponse, RoleResponse } from '@/lib/api/types'
import { DEBOUNCE_MS, PAGE_SIZE } from '@/lib/constants'

const emptyForm = { username: '', email: '', phoneNumber: '', roleId: '' as string | number, ra: '' }

export default function AdminUsuariosPage() {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<UserResponse[]>([])
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selected, setSelected] = useState<UserResponse | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (search: string, page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUsers({ searchParam: search || undefined, page, size: PAGE_SIZE })
      setUsers(data.content ?? [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch {
      setError('Não foi possível carregar os usuários.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load('', 0)
    getRoles({ size: 100 })
      .then((data) => setRoles(data.content ?? []))
      .catch(() => {})
  }, [load])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => { setCurrentPage(0); load(value, 0) }, DEBOUNCE_MS)
  }

  const handlePageChange = (page: number) => { setCurrentPage(page); load(searchQuery, page) }

  const handleOpenDialog = (user?: UserResponse) => {
    setFormError(null)
    setSelected(user ?? null)
    setFormData(user
      ? { username: user.username, email: user.email, phoneNumber: user.phoneNumber ?? '', roleId: user.roleId, ra: user.ra ?? '' }
      : emptyForm)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFormError(null)
    const payload = {
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber || undefined,
      roleId: Number(formData.roleId),
      ra: formData.ra || undefined,
    }
    try {
      if (selected) {
        await updateUser(selected.id, payload)
      } else {
        await createUser(payload)
      }
      await load(searchQuery, currentPage)
      setIsDialogOpen(false)
    } catch {
      setFormError(selected ? 'Erro ao atualizar o usuário.' : 'Erro ao criar o usuário.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      await deleteUser(selected.id)
      const newPage = users.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(newPage)
      await load(searchQuery, newPage)
    } catch {
      setError('Erro ao excluir o usuário.')
    } finally {
      setIsDeleteDialogOpen(false)
      setSelected(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários e suas permissões</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />Novo Usuário
        </Button>
      </div>

      {error && (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="text" placeholder="Buscar por email, telefone ou papel..." value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)} className="pl-10" />
        </div>
        <Badge variant="outline">{totalElements} usuário(s)</Badge>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden sm:table-cell">Contato</TableHead>
              <TableHead className="hidden sm:table-cell">Papel</TableHead>
              <TableHead className="hidden md:table-cell">RA</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum usuário encontrado.</p>
                </TableCell>
              </TableRow>
            ) : users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.username}</p>
                      {user.id === currentUser?.id && <Badge variant="secondary" className="text-xs">Você</Badge>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1 text-sm"><Mail className="h-3 w-3 text-muted-foreground" />{user.email}</p>
                    {user.phoneNumber && <p className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="h-3 w-3" />{user.phoneNumber}</p>}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline"><Shield className="mr-1 h-3 w-3" />{user.roleName}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{user.ra ?? '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(user); setIsDeleteDialogOpen(true) }}
                      disabled={user.id === currentUser?.id}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Página {currentPage + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0 || isLoading}>
              <ChevronLeft className="h-4 w-4" />Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>
              Próxima<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {selected ? 'Atualize as informações do usuário.' : 'Preencha as informações do novo usuário. Um e-mail será enviado para o usuário criar sua senha.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Ex: joao.silva" maxLength={20} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Ex: joao@universidade.com" maxLength={254} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Ex: (11) 99999-9999" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ra">RA (opcional)</Label>
              <Input id="ra" value={formData.ra} onChange={(e) => setFormData({ ...formData, ra: e.target.value })} placeholder="Ex: RA123456" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleId">Papel *</Label>
              <Select value={String(formData.roleId)} onValueChange={(v) => setFormData({ ...formData, roleId: Number(v) })} required>
                <SelectTrigger id="roleId"><SelectValue placeholder="Selecione um papel" /></SelectTrigger>
                <SelectContent>{roles.map((role) => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSaving || !formData.username.trim() || !formData.email.trim() || !formData.roleId} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isSaving ? 'Salvando...' : selected ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir o usuário &quot;{selected?.username}&quot;? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
