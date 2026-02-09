import { NavItem } from "../../schemas/config.schema";

export function getNavCollectionPath(item: NavItem): string | undefined {
  return item.collection?.path;
}

export function getNavDisplayFields(item: NavItem): string[] | undefined {
  return item.collection?.display_fields;
}

export function getNavListOverrides(item: NavItem) {
  return item.collection?.list_overrides;
}

export function getNavFormOverrides(item: NavItem) {
  return item.collection?.form_overrides;
}
