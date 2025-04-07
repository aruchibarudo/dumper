'use client'

import { createContext, useContext, useState } from 'react'
import { Project } from '@/app/projects/[id]/types'
import { ProjectContextType } from '@/app/context/project/types'
import { Children } from '@/app/types'

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: Children) => {
  const [project, setProject] = useState<Project | null>(null)

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
