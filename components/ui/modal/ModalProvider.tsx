'use client'

import { createContext, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Modal } from '@consta/uikit/Modal'
import { Text } from '@consta/uikit/Text'
import {
  ModalContextProps,
  ModalContextProviderType,
  ModalContextType,
} from '@/components/ui/modal/types'
import { Children } from '@/app/types'

export const ModalContext = createContext<ModalContextType>({
  setModal: () => {},
  closeModal: () => {},
})
ModalContext.displayName = 'ModalContext'

const ModalProvider = ({ children }: Children) => {
  const [modals, setModals] = useState<
    (ModalContextProviderType & { id: string })[]
  >([])

  const setModal = useCallback(
    ({ title, content, modalProps, queued = true }: ModalContextProps) => {
      const newModal = {
        id: uuidv4(),
        isOpen: true,
        title,
        content,
        modalProps,
      }
      setModals((prev) =>
        queued ? [...prev, newModal] : [...prev.slice(0, -1), newModal],
      )
    },
    [],
  )

  const closeModal = useCallback((modalId?: string) => {
    setModals((prev) =>
      modalId ? prev.filter((m) => m.id !== modalId) : prev.slice(0, -1),
    )
  }, [])

  const clearModals = useCallback(() => {
    setModals([])
  }, [])

  const value = { setModal, closeModal, clearModals }

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={modal.isOpen}
          onClickOutside={() => closeModal(modal.id)}
          onClose={() => closeModal(modal.id)}
          {...modal.modalProps}
        >
          <div className="p-4">
            {modal.title && (
              <Text size="xl" weight="bold" as="h2" className="mb-4">
                {modal.title}
              </Text>
            )}
            {modal.content}
          </div>
        </Modal>
      ))}
    </ModalContext.Provider>
  )
}

export default ModalProvider
