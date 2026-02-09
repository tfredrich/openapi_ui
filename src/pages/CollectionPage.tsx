import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { buildResourcePath, decodeCollectionPath } from "../utils/routes";
import { useConfigStore } from "../state/useConfigStore";
import { NavItem } from "../../schemas/config.schema";
import { useRegistryStore } from "../state/useRegistryStore";
import { useOasStore } from "../state/useOasStore";
import { resolveBaseUrl } from "../services/baseUrl";
import { apiRequest } from "../services/apiClient";
import { applyDisplayFields, applyListOverrides, extractPropertyKeys, formatCellValue, getSchemaPropertyTitle } from "../utils/schema";
import { useMemo, useState } from "react";

type CollectionRow = Record<string, unknown>;
type CollectionResult =
  | CollectionRow[]
  | {
      items?: CollectionRow[];
      data?: CollectionRow[];
      total?: number;
    };

export function CollectionPage() {
  const { collectionPath } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const resolvedPath = decodeCollectionPath(collectionPath);
  const { config } = useConfigStore();
  const { registry } = useRegistryStore();
  const { oas } = useOasStore();
  const findLabel = (items: NavItem[]): string | undefined => {
    for (const item of items) {
      if (item.path === resolvedPath) return item.label;
      if (item.children) {
        const nested = findLabel(item.children);
        if (nested) return nested;
      }
    }
    return undefined;
  };
  const label = config?.navigation ? findLabel(config.navigation) ?? "Collection" : "Collection";
  const entry = resolvedPath ? registry?.collections[resolvedPath] : undefined;
  const resourcePath = resolvedPath ? registry?.resourceByCollection[resolvedPath] : undefined;
  const resourceEntry = resourcePath ? registry?.resources[resourcePath] : undefined;
  const baseUrl = resolveBaseUrl(config, oas);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const queryParams = entry?.get?.queryParams ?? [];
  const searchParam = useMemo(() => pickSearchParam(queryParams), [queryParams]);
  const pagination = useMemo(() => pickPaginationParams(queryParams), [queryParams]);
  const requestQuery = useMemo(
    () =>
      buildQueryParams({
        searchParam,
        searchValue: "",
        pagination,
        page,
        rowsPerPage,
      }),
    [searchParam, pagination, page, rowsPerPage]
  );

  const { data, isLoading, error } = useQuery<CollectionResult>({
    queryKey: ["collection", baseUrl, resolvedPath, requestQuery],
    enabled: Boolean(baseUrl && resolvedPath),
    queryFn: () => apiRequest({ baseUrl: baseUrl!, path: resolvedPath!, query: requestQuery }),
  });

  const schema = entry?.get?.responseSchema;
  const hasCreate = Boolean(entry?.post);
  const hasRowActions = Boolean(resourceEntry?.get || resourceEntry?.put || resourceEntry?.delete);
  const listData = Array.isArray(data) ? undefined : data;
  const rows = Array.isArray(data) ? data : listData?.items ?? listData?.data ?? [];
  const totalCount = typeof listData?.total === "number" ? listData.total : rows.length;
  const hasServerPagination = Boolean(
    pagination.pageParam || pagination.limitParam || pagination.offsetParam || pagination.sizeParam
  );
  const allFields = extractPropertyKeys(schema);
  const fallbackFields = allFields.length > 0 ? allFields : rows[0] ? Object.keys(rows[0]) : [];
  const displayFields = applyDisplayFields(
    config?.navigation ? findDisplayFields(config.navigation, resolvedPath) : undefined,
    fallbackFields
  );
  const listOverrides = config?.navigation
    ? findListOverrides(config.navigation, resolvedPath)
    : undefined;
  const resolvedFields = applyListOverrides(displayFields, listOverrides);
  const columns = useMemo<GridColDef[]>(
    () => [
      ...resolvedFields.map((field) => ({
        field,
        headerName: listOverrides?.labels?.[field] ?? getSchemaPropertyTitle(schema, field) ?? field,
        flex: 1,
        minWidth: 140,
        sortable: false,
        renderCell: (params: { row: CollectionRow }) => formatCellValue(params.row?.[field]),
      })),
      {
        field: "__actions",
        headerName: "Actions",
        width: 88,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        renderCell: (params: { row: CollectionRow & { __resourceId?: string | number | null } }) =>
          hasRowActions ? (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                const rowId = params.row?.__resourceId;
                if (rowId === null || rowId === undefined) return;
                setMenuAnchor(event.currentTarget);
                setSelectedRowId(rowId);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ) : null,
      },
    ],
    [resolvedFields, listOverrides?.labels, schema, hasRowActions]
  );
  const gridRows = useMemo(
    () =>
      rows.map((row: CollectionRow, index: number) => {
        const resourceId = getRowId(row, resolvedFields, resourceEntry?.resourceIdParamName);
        return {
          id: resourceId ?? `row-${page}-${index}`,
          __resourceId: resourceId,
          ...row,
        };
      }),
    [rows, resolvedFields, resourceEntry?.resourceIdParamName, page]
  );
  const paginationModel: GridPaginationModel = {
    page,
    pageSize: rowsPerPage,
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      if (!resourcePath || !baseUrl) return;
      const resolved = buildResourcePath(resourcePath, id);
      return apiRequest({ baseUrl, path: resolved, method: "DELETE" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collection", baseUrl, resolvedPath], exact: false });
      if (resourcePath && selectedRowId !== null) {
        const resolved = buildResourcePath(resourcePath, selectedRowId);
        await queryClient.invalidateQueries({ queryKey: ["detail", baseUrl, resolved], exact: false });
      }
      setMenuAnchor(null);
      setSelectedRowId(null);
      setDeleteOpen(false);
    },
  });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Fab
            color="primary"
            aria-label="add"
            size="small"
            component={RouterLink}
            disabled={!hasCreate}
            to={resolvedPath ? `/${collectionPath}/new` : "/"}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>
      <Card variant="outlined">
        <CardContent>
          {!baseUrl && (
            <Typography variant="subtitle2" color="error" sx={{ mb: 2 }}>
              Missing API base URL.
            </Typography>
          )}
          {!entry && (
            <Typography variant="subtitle2" color="error" sx={{ mb: 2 }}>
              No collection operation available for this path.
            </Typography>
          )}
          {isLoading && (
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Loading...
            </Typography>
          )}
          {error && (
            <Typography variant="subtitle2" color="error" sx={{ mb: 2 }}>
              Failed to load data.
            </Typography>
          )}
          {!isLoading && !error && (
            <>
              {resolvedFields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No fields available for this collection.
                </Typography>
              ) : (
                <Box sx={{ width: "100%" }}>
                  <DataGrid
                    rows={gridRows}
                    columns={columns}
                    disableRowSelectionOnClick
                    pagination
                    paginationMode={hasServerPagination ? "server" : "client"}
                    rowCount={hasServerPagination ? totalCount : undefined}
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model: GridPaginationModel) => {
                      setPage(model.page);
                      setRowsPerPage(model.pageSize);
                    }}
                    autoHeight
                    onRowClick={(params: { row: CollectionRow & { __resourceId?: string | number | null } }) => {
                      const rowId = params.row?.__resourceId;
                      if (rowId === null || rowId === undefined || !collectionPath || !resourceEntry?.get) return;
                      navigate(`/${collectionPath}/${encodeURIComponent(String(rowId))}`);
                    }}
                    sx={{
                      borderColor: "divider",
                      "& .MuiDataGrid-columnHeaders": {
                        bgcolor: "action.hover",
                      },
                      "& .MuiDataGrid-row:hover": {
                        cursor: resourceEntry?.get ? "pointer" : "default",
                      },
                    }}
                  />
                </Box>
              )}
              {!hasServerPagination && rows.length > 0 && (
                <Chip
                  label={`${rows.length} rows`}
                  size="small"
                  sx={{ mt: 1.5 }}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedRowId(null);
        }}
      >
        {resourceEntry?.get && selectedRowId !== null && (
          <MenuItem
            onClick={() => {
              if (collectionPath) {
                navigate(`/${collectionPath}/${encodeURIComponent(String(selectedRowId))}`);
              }
              setMenuAnchor(null);
            }}
          >
            View
          </MenuItem>
        )}
        {resourceEntry?.put && selectedRowId !== null && (
          <MenuItem
            onClick={() => {
              if (collectionPath) {
                navigate(
                  `/${collectionPath}/${encodeURIComponent(String(selectedRowId))}/edit`
                );
              }
              setMenuAnchor(null);
            }}
          >
            Edit
          </MenuItem>
        )}
        {resourceEntry?.delete && selectedRowId !== null && (
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
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        aria-labelledby="delete-resource-title"
      >
        <DialogTitle id="delete-resource-title">Delete resource?</DialogTitle>
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
              if (selectedRowId !== null) {
                deleteMutation.mutate(selectedRowId);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function findDisplayFields(items: NavItem[], path: string | null): string[] | undefined {
  if (!path) return undefined;
  for (const item of items) {
    if (item.path === path) return item.display_fields;
    if (item.children) {
      const nested = findDisplayFields(item.children, path);
      if (nested) return nested;
    }
  }
  return undefined;
}

function findListOverrides(
  items: NavItem[],
  path: string | null
): { hidden?: string[]; labels?: Record<string, string>; order?: string[] } | undefined {
  if (!path) return undefined;
  for (const item of items) {
    if (item.path === path) return item.list_overrides;
    if (item.children) {
      const nested = findListOverrides(item.children, path);
      if (nested) return nested;
    }
  }
  return undefined;
}

function getRowId(row: any, fields: string[], resourceIdParamName?: string) {
  if (!row || typeof row !== "object") return null;
  if (resourceIdParamName && row[resourceIdParamName] !== undefined) {
    return row[resourceIdParamName];
  }
  if (resourceIdParamName) {
    const snake = toSnakeCase(resourceIdParamName);
    if (row[snake] !== undefined) return row[snake];
  }
  if (row.id !== undefined) return row.id;
  for (const key of fields) {
    if (row[key] !== undefined) return row[key];
  }
  return null;
}

type PaginationParams = {
  pageParam?: string;
  sizeParam?: string;
  limitParam?: string;
  offsetParam?: string;
};

function pickSearchParam(params: { name: string; schema?: any }[]) {
  const candidates = ["search", "q", "query", "filter"];
  const match = params.find((param) => candidates.includes(param.name.toLowerCase()));
  if (match) return match.name;
  const stringParam = params.find(
    (param) =>
      param.name &&
      !["page", "page_number", "limit", "offset", "size", "page_size", "per_page", "skip"].includes(
        param.name.toLowerCase()
      ) &&
      (param.schema?.type === "string" || param.schema?.type === undefined)
  );
  return stringParam?.name;
}

function pickPaginationParams(params: { name: string }[]): PaginationParams {
  const find = (keys: string[]) => params.find((param) => keys.includes(param.name.toLowerCase()))?.name;
  return {
    pageParam: find(["page", "page_number"]),
    sizeParam: find(["size", "page_size", "per_page"]),
    limitParam: find(["limit"]),
    offsetParam: find(["offset", "skip"]),
  };
}

function buildQueryParams({
  searchParam,
  searchValue,
  pagination,
  page,
  rowsPerPage,
}: {
  searchParam?: string;
  searchValue: string;
  pagination: PaginationParams;
  page: number;
  rowsPerPage: number;
}) {
  const query: Record<string, string | number> = {};
  if (searchParam && searchValue.trim()) {
    query[searchParam] = searchValue.trim();
  }
  if (pagination.limitParam) {
    query[pagination.limitParam] = rowsPerPage;
  }
  if (pagination.offsetParam) {
    query[pagination.offsetParam] = page * rowsPerPage;
  }
  if (pagination.pageParam) {
    query[pagination.pageParam] = page + 1;
  }
  if (pagination.sizeParam) {
    query[pagination.sizeParam] = rowsPerPage;
  }
  return query;
}

function toSnakeCase(input: string) {
  return input.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
