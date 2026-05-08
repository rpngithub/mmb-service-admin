import { Form } from 'rsuite'

const FormField = ({ label, name, children, error, required }) => (
  <Form.Group controlId={name}>
    <Form.ControlLabel>
      {label}
      {required && <span style={{ color: '#f5222d', marginLeft: 2 }}>*</span>}
    </Form.ControlLabel>
    {children}
    {error && <Form.HelpText style={{ color: '#f5222d' }}>{error}</Form.HelpText>}
  </Form.Group>
)

export default FormField
