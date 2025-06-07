import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = "6601054811-8p9l255i8127pevt13m4subjve3jokf6.apps.googleusercontent.com";
createRoot(document.getElementById('root')!).render(
   <GoogleOAuthProvider clientId={CLIENT_ID}>
<StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
   </GoogleOAuthProvider>
 
  
)
