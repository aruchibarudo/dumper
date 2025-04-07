import { createContext, useReducer } from 'react'
import { SnackBar } from '@consta/uikit/SnackBar'
import {
  SnackbarActionType,
  SnackbarAddProps,
  SnackbarContextProps,
} from '@/components/ui/snackbar/types'
import { snackbarReducer } from '@/components/ui/snackbar/utils'
import { Children } from '@/app/types'

export const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined,
)
SnackbarContext.displayName = 'SnackbarContext'

const SnackbarProvider = ({ children }: Children) => {
  const [items, dispatchItems] = useReducer(snackbarReducer, [])

  const addSnackbar = ({ message, status }: SnackbarAddProps) => {
    const key = Date.now()
    const item = { key, message, status }
    dispatchItems({ type: SnackbarActionType.Add, item })
  }

  return (
    <SnackbarContext.Provider value={{ addSnackbar }}>
      {children}

      <div className="fixed bottom-2 right-2 z-10">
        <SnackBar
          items={items}
          onItemClose={(item) =>
            dispatchItems({ type: SnackbarActionType.Remove, item })
          }
          getItemAutoClose={() => 5}
        />
      </div>
    </SnackbarContext.Provider>
  )
}

export default SnackbarProvider
