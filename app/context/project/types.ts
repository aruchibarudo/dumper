import { Project } from '@/app/projects/[id]/types'

export type ProjectContextType = {
  project: Project | null
  setProject: (project: Project | null) => void
}
