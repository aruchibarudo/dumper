import { IconSearchStroked } from '@consta/icons/IconSearchStroked'
import { SearchInputProps } from '@/app/projects/[id]/pcap/search/types'
import { TextField } from '@consta/uikit/TextField'

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Поиск...',
  className = '',
}: SearchInputProps) => {
  return (
    <TextField
      className={className}
      placeholder={placeholder}
      leftSide={IconSearchStroked}
      value={value}
      onChange={(value) => onChange(value || '')}
      aria-label="Поиск"
      size="s"
    />
  )
}
