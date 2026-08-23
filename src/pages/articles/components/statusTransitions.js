// Plain data module (no JSX) so this is importable/testable without a JSX
// transform pipeline — kept separate from PublishActions.jsx for that reason.
// Icon components are attached in PublishActions.jsx since importing lucide-react
// icons here would be fine too, but keeping this file icon-agnostic keeps it trivially testable.
export const TRANSITION_DEFS = {
  draft: [
    { to: "published", label: "Publish", tone: "primary", confirm: "This makes the article live and publicly visible immediately." },
    { to: "archived", label: "Archive", tone: "muted", confirm: "This hides the article from all listings." },
  ],
  published: [
    { to: "draft", label: "Unpublish", tone: "muted", confirm: "This takes the article off the live site and returns it to draft." },
    { to: "archived", label: "Archive", tone: "muted", confirm: "This hides the article from all listings." },
  ],
  archived: [
    { to: "published", label: "Publish", tone: "primary", confirm: "This makes the article live and publicly visible immediately." },
    { to: "draft", label: "Restore to draft", tone: "muted", confirm: "This restores the article as an editable draft." },
  ],
};
