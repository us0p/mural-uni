// Legacy localStorage document type — used by public /documentos page and chat widget
export interface Document {
  id: string
  name: string
  fileName: string
  fileType: string
  fileSize: number
  isPublic: boolean
  isKnowledgeBase: boolean
  minAccessLevel: number
  uploadedBy: string
  createdAt: string
}

export interface Subscriber {
  id: string
  email: string
  subscribedAt: string
}
