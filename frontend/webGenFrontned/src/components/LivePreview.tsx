
//added by dibya-last
import { MonitorPlay, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ProjectFile } from "@/api/projectFilesApi";

import { Button } from "@/components/ui/button";

function pick(
  files: ProjectFile[],
  test: (file: ProjectFile) => boolean,
) {
  return files.filter(test);
}

export function buildPreviewDocument(
  files: ProjectFile[],
): string {

  // ============================================================
  // FIND HTML FILE
  // ============================================================

  const html = files.find(
    (file) =>
      file.path.endsWith(".html") ||
      (file.language ?? "")
        .toLowerCase()
        .includes("html"),
  );

  if (!html) {
    return "";
  }

  // ============================================================
  // COLLECT CSS FILES
  // ============================================================

  const css = pick(files, (file) => {
    const language = (file.language ?? "").toLowerCase();

    return (
      file.path.endsWith(".css") ||
      language.includes("css")
    );
  })
    .map((file) => file.content)
    .join("\n\n");

  // ============================================================
  // COLLECT JAVASCRIPT FILES
  // ============================================================

  const js = pick(files, (file) => {
    const language = (file.language ?? "").toLowerCase();

    return (
      file.path.endsWith(".js") ||
      language.includes("javascript")
    );
  })
    .map((file) => file.content)
    .join("\n\n");

  let document = html.content;

  // ============================================================
  // REMOVE LOCAL CSS LINK TAGS
  // ============================================================

  document = document.replace(
    /<link[^>]+rel=["']stylesheet["'][^>]*>/gi,
    (tag) => {

      // Keep external stylesheets
      if (/https?:\/\/ /i.test(tag)) {
        return tag;
      }

      return "";
    },
  );

  // ============================================================
  // REMOVE LOCAL JS SCRIPT TAGS
  // ============================================================

  document = document.replace(
    /<script[^>]*src=["'](?!https?:\/\/)[^"']+["'][^>]*><\/script>/gi,
    "",
  );

  // ============================================================
  // INLINE CSS
  // ============================================================

  const styleTag = css
    ? `<style>
${css}
</style>`
    : "";

  // ============================================================
  // INLINE JAVASCRIPT
  // ============================================================

  const scriptTag = js
    ? `<script>
${js}
</script>`
    : "";

  // ============================================================
  // INSERT CSS INTO HEAD
  // ============================================================

  if (/<\/head>/i.test(document)) {

    document = document.replace(
      /<\/head>/i,
      `${styleTag}</head>`,
    );

  } else {

    document = `${styleTag}\n${document}`;

  }

  // ============================================================
  // INSERT JAVASCRIPT BEFORE BODY
  // ============================================================

  if (/<\/body>/i.test(document)) {

    document = document.replace(
      /<\/body>/i,
      `${scriptTag}</body>`,
    );

  } else {

    document = `${document}\n${scriptTag}`;

  }

  // ============================================================
  // IMPORTANT:
  // SEND WEBSITE HEIGHT TO PARENT WINDOW
  //
  // This allows the React iframe to automatically grow
  // according to the generated website's actual height.
  // ============================================================

  const resizeScript = `
<script>
(function () {

  function sendHeight() {

    const body = document.body;
    const html = document.documentElement;

    if (!body || !html) {
      return;
    }

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.scrollHeight,
      html.offsetHeight,
      html.clientHeight
    );

    window.parent.postMessage(
      {
        type: "AIWEBGEN_PREVIEW_HEIGHT",
        height: height
      },
      "*"
    );
  }

  // Initial height
  window.addEventListener("load", function () {
    sendHeight();

    setTimeout(sendHeight, 100);
    setTimeout(sendHeight, 300);
    setTimeout(sendHeight, 1000);
  });

  // Watch for content/layout changes
  if (window.ResizeObserver) {

    const observer = new ResizeObserver(function () {
      sendHeight();
    });

    observer.observe(document.documentElement);

    if (document.body) {
      observer.observe(document.body);
    }
  }

  // Also check periodically because some generated
  // websites change their height after JavaScript runs.
  setInterval(sendHeight, 1000);

})();
</script>
`;

  // ============================================================
  // ADD RESIZE SCRIPT BEFORE </BODY>
  // ============================================================

  if (/<\/body>/i.test(document)) {

    document = document.replace(
      /<\/body>/i,
      `${resizeScript}</body>`,
    );

  } else {

    document = `${document}\n${resizeScript}`;

  }

  return document;
}


// ============================================================
// PROPS
// ============================================================

type Props = {
  files: ProjectFile[];
  refreshKey: number;
  onRefresh: () => void;
};


// ============================================================
// LIVE PREVIEW
// ============================================================

export default function LivePreview({
  files,
  refreshKey,
  onRefresh,
}: Props) {

  const srcDoc = useMemo(
    () => buildPreviewDocument(files),
    [files],
  );

  // ============================================================
  // IFRAME HEIGHT
  // ============================================================

  const [iframeHeight, setIframeHeight] = useState(700);

  // ============================================================
  // RESET HEIGHT WHEN WEBSITE CHANGES
  // ============================================================

  useEffect(() => {
    setIframeHeight(700);
  }, [srcDoc, refreshKey]);

  // ============================================================
  // LISTEN FOR HEIGHT FROM IFRAME
  // ============================================================

  useEffect(() => {

    const handleMessage = (
      event: MessageEvent,
    ) => {

      // Only accept messages from our iframe
      if (
        event.data?.type !==
        "AIWEBGEN_PREVIEW_HEIGHT"
      ) {
        return;
      }

      const height = Number(
        event.data.height,
      );

      if (!Number.isFinite(height)) {
        return;
      }

      // Prevent extremely small iframe
      const safeHeight = Math.max(
        height,
        500,
      );

      setIframeHeight(safeHeight);
    };

    window.addEventListener(
      "message",
      handleMessage,
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage,
      );
    };

  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full">

      {/* ======================================================
          PREVIEW HEADER
          ====================================================== */}

      <div className="flex items-center justify-between border-b border-border px-4 py-2">

        <p className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">

          <MonitorPlay className="size-4" />

          Live preview

        </p>


        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >

          <RefreshCw className="size-3.5" />

          Refresh

        </Button>

      </div>


      {/* ======================================================
          PREVIEW CONTAINER

          IMPORTANT:
          No h-full
          No flex-1
          No overflow-auto
          ====================================================== */}

      <div className="bg-background p-3">

        {srcDoc ? (

          <div className="w-full overflow-hidden rounded-lg border border-border bg-white">

            <iframe
              key={refreshKey}
              title="Website preview"
              srcDoc={srcDoc}

              sandbox="
                allow-scripts
                allow-forms
                allow-modals
                allow-popups
              "

              className="
                block
                w-full
                border-0
              "

              style={{
                height: `${iframeHeight}px`,
                overflow: "hidden",
              }}
            />

          </div>

        ) : (

          <div className="flex min-h-[500px] items-center justify-center rounded-lg border border-dashed border-border">

            <p className="text-sm text-muted-foreground">

              No HTML file yet — ask the AI
              to generate a website.

            </p>

          </div>

        )}

      </div>

    </div>
  );
}