import { useEffect, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { ImagePlus } from "lucide-react";
import Toolbar, { insertImageIntoEditor } from "./Toolbar";
import { ImageNode } from "./ImageNode";
import { editorTheme } from "./theme";
import Modal from "../../../../components/ui/modal/Modal";
import { inputClass } from "../../../products/form/FormField";

// Lexical's default node.exportDOM() reuses createDOM(), which applies the editor
// theme's Tailwind classes (see theme.js) — those exist purely for in-editor display
// and must never end up in the persisted `content` string, since the public site's
// article typography targets bare tags (h2/p/img with no classes, see ArticlePreview's
// ported CSS). Without this the saved HTML would carry admin-only styling and silently
// stop matching the reader-facing stylesheet.
function stripPresentationalAttrs(html) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  dom.body.querySelectorAll("[class], [style]").forEach((el) => {
    el.removeAttribute("class");
    el.removeAttribute("style");
  });
  return dom.body.innerHTML;
}

function InitialContentPlugin({ initialHtml }) {
  const [editor] = useLexicalComposerContext();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (!initialHtml) return;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      nodes.forEach((node) => root.append(node));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
}

function InsertImageModal({ open, onClose, onInsert, galleryOptions }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  const submit = () => {
    if (!url.trim()) return;
    onInsert(url.trim(), alt.trim());
    setUrl("");
    setAlt("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Insert image" size="md">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Image URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Alt text</label>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image" className={inputClass} />
        </div>

        {galleryOptions?.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Or pick from this article's gallery</label>
            <div className="grid grid-cols-4 gap-2">
              {galleryOptions.map((img) => (
                <button
                  type="button"
                  key={img.publicId || img.url}
                  onClick={() => {
                    onInsert(img.url, img.caption || "");
                    onClose();
                  }}
                  className="aspect-square overflow-hidden rounded-lg border border-gray-200 hover:ring-2 hover:ring-primary/30"
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            Insert
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ImageInsertTrigger({ galleryOptions }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToolbarSlot onOpen={() => setOpen(true)} />
      <InsertImageModal
        open={open}
        onClose={() => setOpen(false)}
        galleryOptions={galleryOptions}
        onInsert={(src, alt) => insertImageIntoEditor(editor, src, alt)}
      />
    </>
  );
}

// Small indirection so the toolbar (which needs the same editor context) can
// trigger the modal declared alongside it without prop-drilling through RichTextPlugin.
function ToolbarSlot({ onOpen }) {
  return <Toolbar onInsertImage={onOpen} />;
}

const editorConfig = {
  namespace: "article-editor",
  theme: editorTheme,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode],
  onError(error) {
    console.error(error);
  },
};

// `articleKey` should change (e.g. to the article id/slug, or "new") when switching
// between articles so Lexical fully remounts instead of trying to reconcile a
// completely different document into an existing editor instance.
export default function RichTextEditor({ articleKey, initialHtml, onChangeHtml, galleryOptions }) {
  return (
    <LexicalComposer key={articleKey} initialConfig={editorConfig}>
      <div className="transition-glow overflow-hidden rounded-xl border border-gray-300 focus-within:border-glow focus-within:shadow-glow-sm">
        <ImageInsertTrigger galleryOptions={galleryOptions} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[320px] max-w-none px-4 py-3 text-sm outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute top-3 left-4 text-sm text-gray-400">
                <ImagePlus className="mb-1 size-4 opacity-0" />
                Start writing the article body...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <InitialContentPlugin initialHtml={initialHtml} />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null);
                onChangeHtml(stripPresentationalAttrs(html));
              });
            }}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
