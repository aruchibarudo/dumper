import { ReactNode } from 'react'

export type Params<T> = {
  params: Promise<T>
}

export type Children = { children: ReactNode }
