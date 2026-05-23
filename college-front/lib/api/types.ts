export interface StatsResponse {
  semester_event_count: number
  job_post_count: number
  connected_students: number
  latest_news?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  userId: number
  username: string
  email: string
  phoneNumber?: string
  ra?: string
  roleId: number
  roleName: string
  permissions: string[]
}

export interface UserResponse {
  id: number
  username: string
  email: string
  phoneNumber?: string
  roleId: number
  roleName: string
  ra?: string
}

export interface UserPageResponse {
  content: UserResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface UserRequest {
  username: string
  email: string
  roleId: number
  ra?: string
  phoneNumber?: string
}

export interface RoleResponse {
  id: number
  name: string
}

export interface RolePageResponse {
  content: RoleResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface RoleRequest {
  name: string
}

export interface RolePermissionResponse {
  id: number
  roleId: number
  roleName: string
  permissionId: number
  permissionName: string
}

export interface RolePermissionRequest {
  roleId: number
  permissionId: number
}

export interface PermissionObjectResponse {
  id: number
  name: string
}

export interface NoticeCategoryResponse {
  id: number
  name: string
}

export interface NoticeCategoryRequest {
  name: string
}

export interface NoticeResponse {
  id: number
  userId: number
  username: string
  title: string
  markdownContent: string
  coverImgUrl?: string
  categoryId?: number
  categoryName?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface NoticePageResponse {
  content: NoticeResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface NoticeRequest {
  title: string
  markdownContent: string
  categoryId: number
  coverImgUrl?: string
}

export interface NoticeUpdateRequest {
  title: string
  markdownContent: string
  categoryId: number
  coverImgUrl?: string
}

export interface DocumentResponse {
  id: number
  userId: number
  username: string
  fileName: string
  description?: string
  fileSize: number
  bucketUrl: string
  knowledgeBase: boolean
}

export interface UiItemResponse {
  name: string
}

export interface UiItemRequest {
  name: string
}

export interface UiPermissionObjectResponse {
  id: number
  uiItemName: string
  permissionId: number
  permissionName: string
}

export interface UiPermissionObjectRequest {
  uiItemName: string
  permissionId: number
}

export interface ChatSource {
  documentId: number
  fileName: string
  chunkIndex: number
}

export interface ChatRequest {
  question: string
  contextChunks?: number
}

export interface ChatResponse {
  answer: string
  sources: ChatSource[]
}
