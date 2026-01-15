import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CollectionPage } from "./pages/CollectionPage";
import { DetailPage } from "./pages/DetailPage";
import { FormPage } from "./pages/FormPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { OAuthSilentCallbackPage } from "./pages/OAuthSilentCallbackPage";
import { useConfigStore } from "./state/useConfigStore";
import { NavItem } from "../schemas/config.schema";
import { encodeCollectionPath } from "./utils/routes";

function findFirstPath(items: NavItem[]): string | null {
  for (const item of items) {
    if (item.path) return item.path;
    if (item.children) {
      const nested = findFirstPath(item.children);
      if (nested) return nested;
    }
  }
  return null;
}

function DefaultCollectionRedirect() {
  const { config } = useConfigStore();
  const target = useMemo(() => {
    const path = config?.navigation ? findFirstPath(config.navigation) : null;
    return path ? `/${encodeCollectionPath(path)}` : null;
  }, [config]);

  if (!target) {
    return <CollectionPage />;
  }

  return <Navigate to={target} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/oauth/silent" element={<OAuthSilentCallbackPage />} />
      <Route path="/" element={<DefaultCollectionRedirect />} />
      <Route path="/collections" element={<DefaultCollectionRedirect />} />
      <Route path="/:collectionPath" element={<CollectionPage />} />
      <Route path="/:collectionPath/new" element={<FormPage mode="create" />} />
      <Route path="/:collectionPath/:id" element={<DetailPage />} />
      <Route path="/:collectionPath/:id/edit" element={<FormPage mode="edit" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
