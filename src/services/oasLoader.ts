import SwaggerParser from "@apidevtools/swagger-parser";
import YAML from "yaml";

function looksLikeHtml(text: string) {
  const trimmed = text.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

async function fetchText(source: string) {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to load OAS from ${source}`);
  }
  const rawText = await response.text();
  if (looksLikeHtml(rawText)) {
    throw new Error(`OAS not found at ${source}`);
  }
  return rawText;
}

export async function loadOas(source: string) {
  const rawText = await fetchText(source);
  const parsed = source.endsWith(".yaml") || source.endsWith(".yml") ? YAML.parse(rawText) : JSON.parse(rawText);
  const api = await SwaggerParser.dereference(parsed);
  return api;
}
