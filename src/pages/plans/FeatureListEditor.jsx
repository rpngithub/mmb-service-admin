import { useRef, useEffect } from 'react'
import { Input, IconButton, Button, Stack } from 'rsuite'
import PlusIcon from '@rsuite/icons/Plus'
import TrashIcon from '@rsuite/icons/Trash'
import MoveUpIcon from '@rsuite/icons/MoveUp'
import MoveDownIcon from '@rsuite/icons/MoveDown'

const FeatureListEditor = ({ value = [], onChange }) => {
  const inputsRef = useRef([])
  const focusIndex = useRef(null)

  useEffect(() => {
    if (focusIndex.current != null) {
      inputsRef.current[focusIndex.current]?.focus()
      focusIndex.current = null
    }
  }, [value])

  const update = (i) => (v) => onChange(value.map((f, idx) => (idx === i ? v : f)))

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const add = () => {
    focusIndex.current = value.length
    onChange([...value, ''])
  }

  return (
    <div>
      <Stack direction="column" spacing={8} alignItems="stretch">
        {value.map((feature, i) => (
          <Stack key={i} spacing={4}>
            <Input
              value={feature}
              onChange={update(i)}
              placeholder={`Feature ${i + 1}`}
              inputRef={(el) => { inputsRef.current[i] = el }}
              style={{ flex: 1 }}
            />
            <IconButton icon={<MoveUpIcon />} size="sm" appearance="subtle" disabled={i === 0} onClick={() => move(i, -1)} title="Move up" />
            <IconButton icon={<MoveDownIcon />} size="sm" appearance="subtle" disabled={i === value.length - 1} onClick={() => move(i, 1)} title="Move down" />
            <IconButton icon={<TrashIcon />} size="sm" appearance="subtle" color="red" onClick={() => remove(i)} title="Remove" />
          </Stack>
        ))}
      </Stack>
      <Button appearance="ghost" size="sm" startIcon={<PlusIcon />} onClick={add} style={{ marginTop: value.length ? 8 : 0 }}>
        Add feature
      </Button>
    </div>
  )
}

export default FeatureListEditor
