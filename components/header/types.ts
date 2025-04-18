import { IconExit } from '@consta/icons/IconExit'

export type HeaderMenuItem = {
  label: string
  onClick: () => void
  leftIcon?: typeof IconExit
}
