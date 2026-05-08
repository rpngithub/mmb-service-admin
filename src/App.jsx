import { BrowserRouter } from 'react-router-dom'
import { CustomProvider } from 'rsuite'
import AppRouter from '@/router/AppRouter'
import 'rsuite/dist/rsuite.min.css'

const App = () => {
  return (
    <CustomProvider theme="light">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </CustomProvider>
  )
}

export default App
