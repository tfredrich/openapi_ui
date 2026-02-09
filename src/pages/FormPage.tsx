import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Form } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import Ajv2020 from "ajv/dist/2020";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { decodeCollectionPath, buildResourcePath } from "../utils/routes";
import { useRegistryStore } from "../state/useRegistryStore";
import { useConfigStore } from "../state/useConfigStore";
import { useOasStore } from "../state/useOasStore";
import { resolveBaseUrl } from "../services/baseUrl";
import { apiRequest } from "../services/apiClient";
import { useQuery } from "@tanstack/react-query";
import { NavItem } from "../../schemas/config.schema";
import { IChangeEvent } from "@rjsf/core";

type FormPageProps = {
  mode: "create" | "edit";
};

const validator = customizeValidator({ AjvClass: Ajv2020 });

export function FormPage({ mode }: FormPageProps) {
  const { collectionPath } = useParams();
  const { id } = useParams();
  const resolvedPath = decodeCollectionPath(collectionPath);
  const { registry } = useRegistryStore();
  const { config } = useConfigStore();
  const { oas } = useOasStore();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<any>(undefined);

  const collectionEntry = resolvedPath ? registry?.collections[resolvedPath] : undefined;
  const resourcePath = resolvedPath ? registry?.resourceByCollection[resolvedPath] : undefined;
  const resourceEntry = resourcePath ? registry?.resources[resourcePath] : undefined;
  const baseUrl = resolveBaseUrl(config, oas);

  const schema =
    (mode === "create"
      ? collectionEntry?.post?.requestSchema
      : resourceEntry?.put?.requestSchema) ?? null;

  const formOverrides = config?.navigation
    ? findFormOverrides(config.navigation, resolvedPath)
    : undefined;

  const uiSchema = useMemo(() => {
    const fieldOverrides = formOverrides?.field_overrides;
    const ui: Record<string, unknown> = {};
    if (fieldOverrides?.order?.length) {
      ui["ui:order"] = fieldOverrides.order;
    }
    if (fieldOverrides?.hidden?.length) {
      fieldOverrides.hidden.forEach((field: string) => {
        ui[field] = { ...(ui[field] as object), "ui:widget": "hidden" };
      });
    }
    if (fieldOverrides?.labels) {
      Object.entries(fieldOverrides.labels).forEach(([field, label]) => {
        ui[field] = { ...(ui[field] as object), "ui:title": label };
      });
    }
    if (fieldOverrides?.widgets) {
      Object.entries(fieldOverrides.widgets).forEach(([field, widget]) => {
        ui[field] = { ...(ui[field] as object), "ui:widget": widget };
      });
    }
    return ui;
  }, [formOverrides]);

  const resourceInstancePath =
    resourcePath && id ? buildResourcePath(resourcePath, id) : null;

  const { data: formData, isLoading: isLoadingData } = useQuery({
    queryKey: ["detail", baseUrl, resourceInstancePath],
    enabled: mode === "edit" && Boolean(baseUrl && resourceInstancePath),
    queryFn: () => apiRequest({ baseUrl: baseUrl!, path: resourceInstancePath! }),
  });

  useEffect(() => {
    if (mode !== "edit") return;
    if (formData && formState === undefined) {
      setFormState(formData);
    }
  }, [formData, formState, mode]);

  const handleSubmit = async (event: IChangeEvent) => {
    const formData = event.formData;
    if (!baseUrl || !schema) return;
    setSubmitError(null);
    setIsSubmitting(true);
    if (mode === "create" && resolvedPath) {
      try {
        await apiRequest({ baseUrl, path: resolvedPath, method: "POST", body: formData });
        navigate(`/${collectionPath}`);
        return;
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to create resource");
        setFormState(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
    if (mode === "edit" && resourceInstancePath) {
      try {
        await apiRequest({ baseUrl, path: resourceInstancePath, method: "PUT", body: formData });
        navigate(`/${collectionPath}/${encodeURIComponent(String(id))}`);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to update resource");
        setFormState(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (mode === "edit" && collectionPath && id) {
      navigate(`/${collectionPath}/${encodeURIComponent(String(id))}`);
    } else if (collectionPath) {
      navigate(`/${collectionPath}`);
    } else {
      navigate("/");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {mode === "create" ? "Create" : "Update"} Resource
        </Typography>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
      <Card variant="outlined">
        <CardContent>
          {submitError && (
            <Typography variant="subtitle2" color="error" sx={{ mb: 2 }}>
              {submitError}
            </Typography>
          )}
          {schema ? (
            <Form
              schema={schema as any}
              validator={validator}
              uiSchema={uiSchema}
              formData={mode === "edit" ? formState ?? formData : formState}
              disabled={(mode === "edit" && isLoadingData) || isSubmitting}
              onChange={({ formData }) => setFormState(formData)}
              onSubmit={handleSubmit}
              onError={() => undefined}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Save
                </Button>
              </Box>
            </Form>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No schema available for this resource.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function findFormOverrides(
  items: NavItem[],
  path: string | null
): NavItem["form_overrides"] | undefined {
  if (!path) return undefined;
  for (const item of items) {
    if (item.path === path) return item.form_overrides;
    if (item.children) {
      const nested = findFormOverrides(item.children, path);
      if (nested) return nested;
    }
  }
  return undefined;
}
