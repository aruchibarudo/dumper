export enum SnackbarActionType {
  Add = 'add',
  Remove = 'remove',
}

export type SnackbarItem = {
  key: string | number
  message: string
  status: 'success' | 'warning' | 'alert' | 'system'
}

export type SnackbarAddProps = {
  message: string
  status: 'success' | 'warning' | 'alert' | 'system'
}

export type SnackbarContextProps = {
  addSnackbar: ({ message, status }: SnackbarAddProps) => void
}

export type SnackbarReducerProps = {
  state: SnackbarItem[]
  action: {
    item: SnackbarItem
    type: SnackbarActionType
  }
}
