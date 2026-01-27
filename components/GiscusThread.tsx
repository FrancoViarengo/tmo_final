"use client";

import { useEffect } from "react";

type Props = {
  identifier: string;
  title: string;
  url: string;
  mapping?: "pathname" | "url" | "title" | "specific";
  reactionsEnabled?: boolean;
  strict?: "0" | "1";
  theme?: string;
  lang?: string;
};

export default function GiscusThread({
  identifier,
  title,
  url,
  mapping = "pathname",
  reactionsEnabled = true,
  strict = "0",
  theme = "preferred_color_scheme",
  lang = "es",
}: Props) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    if (!repo || !repoId || !category || !categoryId) return;

    const existing = document.getElementById("giscus-thread");
    if (existing) {
      existing.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", mapping);
    if (mapping === "specific") {
      script.setAttribute("data-term", identifier);
    }
    script.setAttribute("data-strict", strict);
    script.setAttribute("data-reactions-enabled", reactionsEnabled ? "1" : "0");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", lang);
    script.crossOrigin = "anonymous";
    script.async = true;

    const container = document.getElementById("giscus-thread");
    if (container) container.appendChild(script);
  }, [identifier, mapping, repo, repoId, category, categoryId, title, url, reactionsEnabled, strict, theme, lang]);

  if (!repo || !repoId || !category || !categoryId) {
    return (
      <div className="text-sm text-gray-400">
        Configura Giscus en el entorno:
        <code className="bg-white/10 px-1 mx-1">NEXT_PUBLIC_GISCUS_REPO</code>
        <code className="bg-white/10 px-1 mx-1">NEXT_PUBLIC_GISCUS_REPO_ID</code>
        <code className="bg-white/10 px-1 mx-1">NEXT_PUBLIC_GISCUS_CATEGORY</code>
        <code className="bg-white/10 px-1 mx-1">NEXT_PUBLIC_GISCUS_CATEGORY_ID</code>
      </div>
    );
  }

  return <div id="giscus-thread" />;
}
