import { Text } from '@consta/uikit/Text'
import { Select } from '@consta/uikit/Select'
import { TextField } from '@consta/uikit/TextField'
import { NumberFilterOperator, SearchNumberFilterProps } from './types'
import { operatorOptions } from '@/app/projects/[id]/pcap/search/utils'

export const SearchNumberFilter = ({
  label,
  value,
  onChange,
}: SearchNumberFilterProps) => {
  return (
    <div>
      {label && (
        <Text size="s" view="secondary">
          {label}
        </Text>
      )}

      <div className="flex gap-2 items-end">
        <Select
          items={operatorOptions}
          value={operatorOptions.find((opt) => opt.value === value.operator)}
          onChange={(option) =>
            onChange({
              ...value,
              operator: option?.value as NumberFilterOperator,
            })
          }
          getItemLabel={(item) => item.label}
          getItemKey={(item) => item.value}
          size="s"
          style={{ width: '80px' }}
        />
        <TextField
          type="number"
          value={value.value?.toString() || ''}
          onChange={(val) =>
            onChange({ ...value, value: val ? Number(val) : null })
          }
          size="s"
          style={{ width: '120px' }}
        />
      </div>
    </div>
  )
}
