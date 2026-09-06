import {apiFetch} from "./client";
import type {Template} from "../types";

export function getTemplates(): Promise<Template[]> {
    return apiFetch<Template[]>("/templates");
}