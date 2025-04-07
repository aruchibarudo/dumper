import React from 'react'
import { Children } from '@/app/types'

const ContentWrapper = ({ children }: Children) => {
  return (
    <main className="flex justify-center items-center h-[calc(100vh-5rem)] p-4">
      {children}
    </main>
  )
}

export default ContentWrapper
