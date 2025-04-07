import { useContext } from 'react'
import { SnackbarContext } from '@/components/ui/snackbar/SnackbarProvider'
import { SnackbarContextProps } from '@/components/ui/snackbar/types'

export const useSnackbar = (): SnackbarContextProps => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
