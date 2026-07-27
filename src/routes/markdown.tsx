import { createFileRoute } from "@tanstack/react-router";

import { MarkdownPage } from "#/pages/markdown/MarkdownPage";

export const Route = createFileRoute("/markdown")({ component: MarkdownPage });
