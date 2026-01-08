import { Navigate, Route, Routes } from "react-router-dom";
import { CollectionPage } from "./pages/CollectionPage";
import { DetailPage } from "./pages/DetailPage";
import { FormPage } from "./pages/FormPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/collections" replace />} />
      <Route path="/collections" element={<CollectionPage />} />
      <Route path="/collections/:collectionPath" element={<CollectionPage />} />
      <Route path="/collections/:collectionPath/new" element={<FormPage mode="create" />} />
      <Route path="/collections/:collectionPath/:id" element={<DetailPage />} />
      <Route path="/collections/:collectionPath/:id/edit" element={<FormPage mode="edit" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
