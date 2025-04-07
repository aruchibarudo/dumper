import React, { ReactNode } from 'react'

import { PropsWithHTMLAttributes } from '@consta/uikit/__internal__/src/utils/types/PropsWithHTMLAttributes'

// @consta/uikit Modal types
declare type ModalPropWidth = 'auto'
declare type ModalPropPosition = 'center' | 'top'
type ModalProps = PropsWithHTMLAttributes<
  {
    isOpen?: boolean
    onClose?: () => void
    onOpen?: () => void
    hasOverlay?: boolean
    /** @deprecated use onClickOutside */
    onOverlayClick?: (event: MouseEvent) => void
    onClickOutside?: (event: MouseEvent) => void
    onEsc?: (event: KeyboardEvent) => void
    rootClassName?: string
    width?: ModalPropWidth
    position?: ModalPropPosition
    children?: React.ReactNode
    container?: HTMLDivElement | undefined
    afterClose?: () => void
    refsForExcludeClickOutside?: React.RefObject<HTMLElement>[]
  },
  HTMLDivElement
>

export type ModalContextProviderType = {
  isOpen: boolean
  title?: string | null
  content: ReactNode
  modalProps?: Omit<ModalProps, 'open'>
  queued?: boolean
}
export type ModalContextType = {
  setModal: ({ title, content, modalProps }: ModalContextProps) => void
  closeModal: () => void
}
export type ModalContextProps = Pick<
  ModalContextProviderType,
  'title' | 'content' | 'modalProps' | 'queued'
>
