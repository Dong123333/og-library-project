import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AuthWrapper} from "./context/AuthContext.jsx";
import {BookcaseWrapper} from "./context/BookcaseContext.jsx";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthWrapper>
        <BookcaseWrapper>
            <App />
        </BookcaseWrapper>
    </AuthWrapper>,
  {/*</StrictMode>,*/}
)
