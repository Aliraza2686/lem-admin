import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getRoot,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, ListNode } from "@lexical/list";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";
import { $createImageNode } from "./ImageNode";
import { cn } from "../../../../utillls/common";

function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-gray-500 transition duration-150 hover:bg-gray-100",
        active && "bg-primary/5 text-primary shadow-glow-sm"
      )}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ onInsertImage }) {
  const [editor] = useLexicalComposerContext();
  const [format, setFormat] = useState({ bold: false, italic: false, underline: false });
  const [blockType, setBlockType] = useState("paragraph");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    setFormat({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
    });
    const anchorNode = selection.anchor.getNode();
    const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
    if (element.getType() === "heading") setBlockType(element.getTag());
    else if (element.getType() === "quote") setBlockType("quote");
    else if (element.getType() === "listitem") {
      const list = $getNearestNodeOfType(anchorNode, ListNode);
      setBlockType(list?.getListType() === "number" ? "ol" : "ul");
    } else setBlockType("paragraph");
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  const setBlock = (type) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (type === "paragraph") $setBlocksType(selection, () => $createParagraphNode());
      else if (type === "h2" || type === "h3") $setBlocksType(selection, () => $createHeadingNode(type));
      else if (type === "quote") $setBlocksType(selection, () => $createQuoteNode());
    });
  };

  const insertLink = () => {
    const url = window.prompt("Link URL");
    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50/70 px-2 py-1.5">
      <ToolbarButton title="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <Redo2 className="size-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-gray-200" />
      <ToolbarButton title="Paragraph" active={blockType === "paragraph"} onClick={() => setBlock("paragraph")}>
        <Pilcrow className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 2" active={blockType === "h2"} onClick={() => setBlock("h2")}>
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={blockType === "h3"} onClick={() => setBlock("h3")}>
        <Heading3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={blockType === "quote"} onClick={() => setBlock("quote")}>
        <Quote className="size-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-gray-200" />
      <ToolbarButton title="Bold" active={format.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={format.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={format.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
        <Underline className="size-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-gray-200" />
      <ToolbarButton title="Bullet list" active={blockType === "ul"} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={blockType === "ol"} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)}>
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Link" onClick={insertLink}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={onInsertImage}>
        <ImagePlus className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export function insertImageIntoEditor(editor, src, alt) {
  editor.update(() => {
    const selection = $getSelection();
    const node = $createImageNode(src, alt);
    if ($isRangeSelection(selection)) {
      selection.insertNodes([node]);
    } else {
      $getRoot().append(node);
    }
  });
}
