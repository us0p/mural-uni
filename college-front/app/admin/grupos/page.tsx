'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Plus, Pencil, Trash2, Shield, Search, AlertCircle, ChevronLeft, ChevronRight, Check, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import {
  getRoles, createRole, updateRole, deleteRole,
  getPermissionObjects, getRolePermissions, assignPermission, revokePermission,
} from '@/lib/api/roles'
import type { PermissionObjectResponse, RolePermissionResponse, RoleResponse } from '@/lib/api/types'
import { DEBOUNCE_MS, PAGE_SIZE } from '@/lib/constants'

export default function AdminGruposPage() {
  

  // ── listing state ────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // ── dialog state ─────────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selected, setSelected] = useState<RoleResponse | null>(null)
  const [name, setName] = useState('')
  const [allPermissions, setAllPermissions] = useState<PermissionObjectResponse[]>([])
  const [currentPermissions, setCurrentPermissions] = useState<RolePermissionResponse[]>([])
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoadingPerms, setIsLoadingPerms] = useState(false)

  // ── details state ────────────────────────────────────────────────────────
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailsRole, setDetailsRole] = useState<RoleResponse | null>(null)
  const [detailsPermissions, setDetailsPermissions] = useState<RolePermissionResponse[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── load roles list ──────────────────────────────────────────────────────
  const load = useCallback(async (search: string, page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRoles({ searchParam: search || undefined, page, size: PAGE_SIZE })
      const normalised = Array.isArray(data)
        ? { content: data as unknown as RoleResponse[], page: 0, size: (data as unknown as RoleResponse[]).length, totalElements: (data as unknown as RoleResponse[]).length, totalPages: 1 }
        : data
      setRoles(normalised.content ?? [])
      setTotalPages(normalised.totalPages ?? 0)
      setTotalElements(normalised.totalElements ?? 0)
    } catch {
      setError('Não foi possível carregar os grupos de acesso.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load('', 0) }, [load])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setCurrentPage(0)
      load(value, 0)
    }, DEBOUNCE_MS)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    load(searchQuery, page)
  }

  // ── open dialog ──────────────────────────────────────────────────────────
  const handleOpenDialog = async (role?: RoleResponse) => {
    setFormError(null)
    setSelected(role ?? null)
    setName(role?.name ?? '')
    setSelectedPermIds(new Set())
    setCurrentPermissions([])
    setIsDialogOpen(true)
    setIsLoadingPerms(true)
    try {
      const [perms, assigned] = await Promise.all([
        getPermissionObjects(),
        role ? getRolePermissions(role.id) : Promise.resolve([]),
      ])
      setAllPermissions(perms)
      setCurrentPermissions(assigned)
      setSelectedPermIds(new Set(assigned.map((rp) => rp.permissionId)))
    } catch {
      setFormError('Não foi possível carregar as permissões.')
    } finally {
      setIsLoadingPerms(false)
    }
  }

  const togglePerm = (permId: number) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev)
      next.has(permId) ? next.delete(permId) : next.add(permId)
      return next
    })
  }

  // ── save (create or update) ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFormError(null)
    try {
      // 1. Upsert the role
      const saved = selected
        ? await updateRole(selected.id, { name: name.trim() })
        : await createRole({ name: name.trim() })

      // 2. Sync permissions
      const prevIds = new Set(currentPermissions.map((rp) => rp.permissionId))

      const toAdd = [...selectedPermIds].filter((id) => !prevIds.has(id))
      const toRemove = currentPermissions.filter((rp) => !selectedPermIds.has(rp.permissionId))

      await Promise.all([
        ...toAdd.map((permId) => assignPermission({ roleId: saved.id, permissionId: permId })),
        ...toRemove.map((rp) => revokePermission(rp.id)),
      ])

      await load(searchQuery, currentPage)
      setIsDialogOpen(false)
    } catch {
      setFormError('Erro ao salvar o grupo. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected) return
    try {
      await deleteRole(selected.id)
      const newPage = roles.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage
      setCurrentPage(newPage)
      await load(searchQuery, newPage)
    } catch {
      setError('Erro ao excluir o grupo.')
    } finally {
      setIsDeleteDialogOpen(false)
      setSelected(null)
    }
  }

  // ── details ──────────────────────────────────────────────────────────────
  const handleOpenDetails = async (role: RoleResponse) => {
    setDetailsRole(role)
    setDetailsPermissions([])
    setIsDetailsOpen(true)
    setIsLoadingDetails(true)
    try {
      const perms = await getRolePermissions(role.id)
      setDetailsPermissions(perms)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Grupos de Acesso</h1>
          <p className="text-muted-foreground">Gerencie os grupos e suas permissões</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou permissão..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{totalElements} grupo(s)</Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum grupo encontrado.</p>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <Shield className="h-5 w-5 text-accent" />
                      </div>
                      <p className="truncate font-medium">{role.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(role)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(role)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelected(role); setIsDeleteDialogOpen(true) }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
            <DialogDescription>
              {selected ? 'Atualize o nome e as permissões do grupo.' : 'Defina o nome e as permissões do novo grupo.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role-name">Nome</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: professor"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{name.length}/20</p>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissões</Label>
              {isLoadingPerms ? (
                <p className="text-sm text-muted-foreground py-2">Carregando permissões...</p>
              ) : allPermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Nenhuma permissão disponível.</p>
              ) : (
                <div className="divide-y divide-border rounded-lg border border-border">
                  {allPermissions.map((perm) => {
                    const checked = selectedPermIds.has(perm.id)
                    return (
                      <div key={perm.id} className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={checked}
                            onCheckedChange={() => togglePerm(perm.id)}
                          />
                          <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer text-sm font-normal">
                            {perm.name}
                          </Label>
                        </div>
                        {checked && <Check className="h-4 w-4 text-accent" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !name.trim() || isLoadingPerms}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSaving ? 'Salvando...' : selected ? 'Salvar Alterações' : 'Criar Grupo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              {detailsRole?.name}
            </DialogTitle>
            <DialogDescription>Detalhes do grupo de acesso</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Permissões associadas</p>
              {isLoadingDetails ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : detailsPermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma permissão atribuída.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detailsPermissions.map((rp) => (
                    <Badge key={rp.id} variant="secondary" className="gap-1">
                      <Check className="h-3 w-3 text-accent" />
                      {rp.permissionName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo &quot;{selected?.name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
