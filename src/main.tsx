import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { GoogleOAuthProvider } from '@react-oauth/google';
createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="551325926859-l5008s14nlk558hf9q036fhf57lfpf3j.apps.googleusercontent.com">
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
  </GoogleOAuthProvider>
)
