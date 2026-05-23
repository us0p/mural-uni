export const UI_ITEM_ROUTES = {
  admin_dashboard: '/admin',
  admin_blog_post: '/admin/posts',
  admin_notice_categories: '/admin/categorias',
  admin_documents: '/admin/documentos',
  admin_users: '/admin/usuarios',
  admin_access_groups: '/admin/grupos',
} as const

export type UiItemName = keyof typeof UI_ITEM_ROUTES
