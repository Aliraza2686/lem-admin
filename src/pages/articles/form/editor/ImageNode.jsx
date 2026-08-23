import { DecoratorNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { X } from "lucide-react";

function ImageComponent({ src, altText, nodeKey }) {
  const [editor] = useLexicalComposerContext();

  const remove = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) node.remove();
    });
  };

  return (
    <span className="group relative my-4 block">
      <img src={src} alt={altText || ""} className="w-full rounded-xl object-cover" draggable={false} />
      <button
        type="button"
        onClick={remove}
        contentEditable={false}
        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </span>
  );
}

export class ImageNode extends DecoratorNode {
  __src;
  __altText;

  static getType() {
    return "image";
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  constructor(src, altText = "", key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  createDOM() {
    const span = document.createElement("span");
    return span;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return new ImageNode(serializedNode.src, serializedNode.altText);
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
    };
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: (domNode) => ({
          node: new ImageNode(domNode.getAttribute("src") || "", domNode.getAttribute("alt") || ""),
        }),
        priority: 1,
      }),
    };
  }

  exportDOM() {
    const img = document.createElement("img");
    img.setAttribute("src", this.__src);
    if (this.__altText) img.setAttribute("alt", this.__altText);
    return { element: img };
  }

  isInline() {
    return false;
  }

  decorate() {
    return <ImageComponent src={this.__src} altText={this.__altText} nodeKey={this.getKey()} />;
  }
}

export const $createImageNode = (src, altText) => new ImageNode(src, altText);
export const $isImageNode = (node) => node instanceof ImageNode;
