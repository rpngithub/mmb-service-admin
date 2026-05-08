import { Modal, Button, Stack } from 'rsuite'
import WarningRoundIcon from '@rsuite/icons/WarningRound'

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} size="xs">
    <Modal.Header>
      <Modal.Title>
        <Stack spacing={8} alignItems="center">
          <WarningRoundIcon style={{ color: '#f5222d', fontSize: 18 }} />
          {title}
        </Stack>
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p style={{ margin: 0, color: '#6b7280' }}>{message}</p>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={onClose} appearance="subtle" disabled={loading}>Cancel</Button>
      <Button onClick={onConfirm} appearance="primary" color="red" loading={loading}>
        {confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
)

export default ConfirmModal
