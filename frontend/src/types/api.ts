export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'USER'

export type ReportStatus =
  | 'PENDING'
  | 'AI_ANALYSIS'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export interface ApiMeta {
  page: number
  limit: number
  total: number
}

export interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
  meta?: ApiMeta
}

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
}

export interface Room {
  id: string
  name: string
  code: string
  floor: string | null
  building: string | null
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface Asset {
  id: string
  roomId: string
  name: string
  assetCode: string
  category: string
  description: string | null
  status: string
  createdAt: string
}

export interface Report {
  id: string
  title: string
  description: string
  status: ReportStatus
  priority: string | null
  aiPriorityScore: number | null
  aiPriorityReason: string | null
  aiRecommendation: string | null
  aiEstimatedRepairHours: number | null
  aiSuggestedAction: string | null
  aiAnalysisStatus: string
  reporterId: string
  roomId: string
  assetId: string | null
  roomName?: string
  roomCode?: string
  assetName?: string | null
  reporterName?: string
  technicianName?: string | null
  assignedTechnicianId: string | null
  assignedAt: string | null
  completedAt: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  histories?: Array<{
    id: string
    action: string
    oldStatus: string | null
    newStatus: string | null
    note: string | null
    createdAt: string
  }>
  rating?: { score: number; comment: string | null; createdAt: string } | null
  attachments?: Array<{
    id: string
    type: 'DAMAGE' | 'REPAIR' | 'OTHER'
    url: string
    createdAt: string
  }>
}

export interface DashboardOverview {
  openReports: number
  inProgress: number
  completedLast30Days: number
  avgRating: number | null
  total?: number
  byStatus?: Record<string, number>
  byPriority?: Record<string, number>
  byRoom?: Array<{ room: string; count: number }>
}

export interface LoginResponse {
  user: User
  accessToken: string
  expiresIn: string
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'

export interface Comment {
  id: string
  reportId: string
  authorId: string
  authorName: string
  authorRole?: string
  content: string
  createdAt: string
}

export interface MaintenanceSchedule {
  id: string
  title: string
  description: string | null
  roomId: string
  roomName?: string
  assetId: string | null
  assetName?: string | null
  technicianId: string
  technicianName?: string
  scheduledDate: string
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  status: MaintenanceStatus
  createdAt: string
  updatedAt: string
}

export interface TechnicianStat {
  technicianId: string
  technicianName: string
  completedTasks: number
  avgRating: number | null
  avgCompletionHours: number | null
}
