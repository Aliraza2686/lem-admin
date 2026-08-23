
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import Profile from './pages/Profile/Profile';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/products/ProductFormPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ArticlesPage from './pages/articles/ArticlesPage';
import ArticleFormPage from './pages/articles/ArticleFormPage';
import ArticleDetailPage from './pages/articles/ArticleDetailPage';
import { ToastProvider } from './components/ui/toast/ToastProvider';
function App() {


  return (
    <>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductFormPage mode="create" />} />
            <Route path="/products/:id/edit" element={<ProductFormPage mode="edit" />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/new" element={<ArticleFormPage mode="create" />} />
            <Route path="/articles/:slug/edit" element={<ArticleFormPage mode="edit" />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </>
  )
}

export default App
