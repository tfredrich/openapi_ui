import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRegistryStore } from "../state/useRegistryStore";
import { useConfigStore } from "../state/useConfigStore";
import { useOasStore } from "../state/useOasStore";
import { resolveBaseUrl } from "../services/baseUrl";
import { apiRequest } from "../services/apiClient";
import { applyListOverrides, extractPropertyKeys, formatCellValue, getSchemaPropertyTitle } from "../utils/schema";
import { NavItem } from "../../schemas/config.schema";
import { buildResourcePath, decodeCollectionPath } from "../utils/routes";
import { getNavCollectionPath, getNavFormOverrides, getNavListOverrides } from "../utils/navigation";

export function DetailPage() {
  const { collectionPath, id } = useParams();
  const resolvedPath = decodeCollectionPath(collectionPath);
  const { registry } = useRegistryStore();
  const { config } = useConfigStore();
  const { oas } = useOasStore();
  const queryClient = useQueryClient();
  const resourcePath = resolvedPath ? registry?.resourceByCollection[resolvedPath] : undefined;
  const resourceEntry = resourcePath ? registry?.resources[resourcePath] : undefined;
  const baseUrl = resolveBaseUrl(config, oas);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const hasActions = Boolean(resourceEntry?.put || resourceEntry?.delete);

  const resolvedResourcePath =
    resourcePath && id ? resourcePath.replace(/\{[^/]+\}/, encodeURIComponent(id)) : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["detail", baseUrl, resolvedResourcePath],
    enabled: Boolean(baseUrl && resolvedResourcePath),
    queryFn: () => apiRequest({ baseUrl: baseUrl!, path: resolvedResourcePath! }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!resourcePath || !baseUrl || !id) return;
      const resolved = buildResourcePath(resourcePath, id);
      return apiRequest({ baseUrl, path: resolved, method: "DELETE" });
    },
    onSuccess: async () => {
      if (resolvedPath) {
        await queryClient.invalidateQueries({ queryKey: ["collection", baseUrl, resolvedPath], exact: false });
      }
      setDeleteOpen(false);
      setMenuAnchor(null);
    },
  });

  const schemaFields = extractPropertyKeys(resourceEntry?.get?.responseSchema);
  const dataFields =
    data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data as Record<string, unknown>) : [];
  const fields = schemaFields.length > 0 ? schemaFields : dataFields;
  const detailOverrides = config?.navigation ? findDetailOverrides(config.navigation, resolvedPath) : undefined;
  const orderedFields = applyListOverrides(fields, detailOverrides);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Detail View {id ? `• ${id}` : ""}
        </Typography>
        {hasActions && (
          <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {resolvedPath ? `Detail view for ${resolvedPath}` : "Detail view"}
          </Typography>
          {!baseUrl && (
            <Typography color="error" variant="body2">
              Missing API base URL.
            </Typography>
          )}
          {!resourceEntry && (
            <Typography color="error" variant="body2">
              No resource operation available for this path.
            </Typography>
          )}
          {isLoading && <Typography>Loading...</Typography>}
          {error && (
            <Typography color="error" variant="body2">
              Failed to load resource.
            </Typography>
          )}
          {!isLoading && !error && fields.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No fields available for this resource.
            </Typography>
          )}
          {!isLoading &&
            !error &&
            orderedFields.map((field) => (
              <Typography key={field}>
                {detailOverrides?.labels?.[field] ??
                  getSchemaPropertyTitle(resourceEntry?.get?.responseSchema, field) ??
                  field}
                : {formatCellValue((data as any)?.[field])}
              </Typography>
            ))}
        </CardContent>
      </Card>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {resourceEntry?.put && id && (
          <MenuItem
            component={RouterLink}
            to={`/${collectionPath}/${encodeURIComponent(id)}/edit`}
            onClick={() => setMenuAnchor(null)}
          >
            Edit
          </MenuItem>
        )}
        {resourceEntry?.delete && id && (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setDeleteOpen(true);
            }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} aria-labelledby="delete-detail-title">
        <DialogTitle id="delete-detail-title">Delete resource?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Are you sure you want to delete this resource?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              deleteMutation.mutate();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function findDetailOverrides(
  items: NavItem[],
  path: string | null
): { hidden?: string[]; labels?: Record<string, string>; order?: string[] } | undefined {
  if (!path) return undefined;
  for (const item of items) {
    if (getNavCollectionPath(item) === path) {
      return (
        getNavFormOverrides(item)?.field_overrides ??
        getNavListOverrides(item)
      );
    }
    if (item.children) {
      const nested = findDetailOverrides(item.children, path);
      if (nested) return nested;
    }
  }
  return undefined;
}
