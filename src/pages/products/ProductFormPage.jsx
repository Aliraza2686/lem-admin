import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../../components/ui/molecules/PageTitle";
import { getProduct } from "../../api/products";
import ProductForm from "./form/ProductForm";

export default function ProductFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== "edit") return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getProduct(id);
      if (cancelled) return;
      if (res.success) {
        setProduct(res.data.product);
      } else {
        setError(res.message || "Product not found");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, mode]);

  return (
    <SidebarLayout>
      <PageTitle
        title={mode === "edit" ? `Edit Product` : "Add Product"}
        path={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Products", href: "/products" },
          { name: mode === "edit" ? product?.name || "Edit" : "New" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
          Loading product...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <AlertTriangle className="size-8 text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
          <button onClick={() => navigate("/products")} className="text-sm font-medium text-indigo-600 hover:underline">
            Back to products
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl">
          <ProductForm mode={mode} initialProduct={product} />
        </div>
      )}
    </SidebarLayout>
  );
}
