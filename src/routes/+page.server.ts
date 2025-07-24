import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const headlines = [
    "Bookmarking, reimagined.",
    "Beyond bookmarks.",
    "The web, organized.",
  ];

  const sublines = [
    "The cursor for bookmarks.",
    "An open source manager for creatives and professionals.",
    "Bringing joy back to bookmarking.",
    "From chaos to clarity — one link at a time.",
    "Tame your tabs. Master your mind.",
    "Blazingly fast. Surprisingly simple.",
    "AI that remembers what you forget.",
    "Clutter-free by design.",
    "No vendor lock-in. Ever.",
    "Where bookmarks feel like second nature.",
    "One place for everything you want to revisit.",
    "Save now, find faster.",
    "Built for flow, not friction.",
    "A calm place for your internet thoughts.",
    "Lightweight, like it should be.",
    "Because the browser wasn't made for memory.",
    "Less chaos. More clarity.",
    "You think in links. So do we.",
    "Minimal UI, maximal focus.",
    "The fastest way to remember anything online.",
    "A notebook that thinks in URLs.",
    "Bookmarks, but beautiful.",
    "Forget folders. Embrace flow.",
    "Privacy-first, purpose-built.",
    "Not another tab manager. A link companion.",
    "For when reading list just isn’t enough.",
  ];

  const headlineIndex = Math.floor(Math.random() * headlines.length);
  const sublineIndex = Math.floor(Math.random() * sublines.length);

  return {
    headline: headlines[headlineIndex],
    subline: sublines[sublineIndex],
  };
}) satisfies PageServerLoad;
