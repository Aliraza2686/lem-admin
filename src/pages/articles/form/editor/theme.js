// Lexical editor theme — CSS classes applied to nodes inside the editable area.
// Mirrors the reading typography scale (see ArticlePreview.jsx) so what the admin
// types roughly matches what readers will see, without literally sharing styles
// (the editor needs different affordances: outlines, cursor states, etc).
export const editorTheme = {
  paragraph: "mb-4 text-[15px] leading-7 text-gray-700",
  heading: {
    h2: "mt-6 mb-3 text-xl font-bold text-gray-900",
    h3: "mt-5 mb-2 text-lg font-semibold text-gray-900",
  },
  quote: "border-l-2 border-indigo-300 pl-4 italic text-gray-500 my-4",
  list: {
    ul: "list-disc pl-6 mb-4 space-y-1 text-[15px] text-gray-700",
    ol: "list-decimal pl-6 mb-4 space-y-1 text-[15px] text-gray-700",
    listitem: "leading-7",
  },
  link: "text-indigo-600 underline underline-offset-2",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
  },
  image: "lexical-image-node",
};
