import { z } from "zod";

const SecurityConfigSchema = z
  .object({
    type: z.enum(["oauth2", "bearer", "none"]),
    client_id: z.string().min(1).optional(),
    client_secret: z.string().min(1).optional(),
    auth_url: z.string().url().optional(),
    token_url: z.string().url().optional(),
    scopes: z.array(z.string().min(1)).optional(),
    audience: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "oauth2") {
      if (!value.client_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "security_config.client_id is required for oauth2",
          path: ["client_id"],
        });
      }
      if (!value.auth_url || !value.token_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "security_config.auth_url and token_url are required for oauth2",
          path: ["auth_url"],
        });
      }
    }
  });

const FieldOverridesSchema = z
  .object({
    hidden: z.array(z.string().min(1)).optional(),
    labels: z.record(z.string().min(1), z.string().min(1)).optional(),
    widgets: z.record(z.string().min(1), z.string().min(1)).optional(),
    order: z.array(z.string().min(1)).optional(),
  })
  .strict();

const FormOverridesSchema = z
  .object({
    layout: z.enum(["single", "multi-step"]).optional(),
    steps: z
      .array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          fields: z.array(z.string().min(1)),
        })
      )
      .optional(),
    field_overrides: FieldOverridesSchema.optional(),
  })
  .strict();

const NavItemSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      label: z.string().min(1),
      path: z.string().min(1).optional(),
      display_fields: z.array(z.string().min(1)).optional(),
      children: z.array(NavItemSchema).optional(),
      list_overrides: FieldOverridesSchema.optional(),
      form_overrides: FormOverridesSchema.optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (!value.path && (!value.children || value.children.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "nav item must include a path or children",
          path: ["path"],
        });
      }
      if (value.path && value.children && value.children.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "nav item cannot include both path and children",
          path: ["children"],
        });
      }
    })
);

export const ConsoleConfigSchema = z
  .object({
    oas_source: z.string().min(1),
    api_base_url: z.string().url().optional(),
    security_config: SecurityConfigSchema.optional(),
    navigation: z.array(NavItemSchema).min(1),
  })
  .strict();

export type ConsoleConfig = z.infer<typeof ConsoleConfigSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
