import {
  SnackbarActionType,
  SnackbarReducerProps,
} from '@/components/ui/snackbar/types'

export const snackbarReducer = (
  state: SnackbarReducerProps['state'],
  action: SnackbarReducerProps['action'],
) => {
  switch (action.type) {
    case SnackbarActionType.Add:
      return [...state, action.item]
    case SnackbarActionType.Remove:
      return state.filter((itemInState) => itemInState.key !== action.item.key)
    default:
      return state
  }
}
