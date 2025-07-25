import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TransitionConfig } from "svelte/transition";
import { cubicIn, cubicOut, elasticOut } from "svelte/easing";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function parseParams(url: string): Record<string, string> {
  if (!url) return {};
  try {
    const params = new URLSearchParams(new URL(url, "http://localhost").search);
    return Object.fromEntries(params);
  } catch (error) {
    console.error("Failed to parse params:", url, error);
    return {};
  }
}

interface FlyAndScaleParams {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
  delay?: number;
}

export function flyAndScale(
  node: Element,
  params: FlyAndScaleParams = {}
): TransitionConfig {
  const { y = -8, x = 0, start = 0.95, duration = 150, delay = 0 } = params;
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    value: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ): number => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;
    const percentage = (value - minA) / (maxA - minA);
    return percentage * (maxB - minB) + minB;
  };

  return {
    duration,
    delay,
    easing: cubicOut,
    css: (t) => {
      const yVal = scaleConversion(t, [0, 1], [y, 0]);
      const xVal = scaleConversion(t, [0, 1], [x, 0]);
      const scale = scaleConversion(t, [0, 1], [start, 1]);
      return `transform: ${transform} translate3d(${xVal}px, ${yVal}px, 0) scale(${scale}); opacity: ${t};`;
    },
  };
}

interface PopParams {
  duration?: number;
  delay?: number;
  power?: number;
}

export function pop(
  node: Element,
  { duration = 300, delay = 0, power = 0.2 }: PopParams = {}
): TransitionConfig {
  return {
    duration,
    delay,
    easing: elasticOut,
    css: (t) => `transform: scale(${1 + Math.sin(t * Math.PI) * power});`,
  };
}

interface RotateParams {
  duration?: number;
  delay?: number;
}

export function rotate(
  node: Element,
  { duration = 600, delay = 0 }: RotateParams = {}
): TransitionConfig {
  return {
    duration,
    delay,
    easing: elasticOut,
    css: (t) => {
      const angle = t * 360;
      const scale = 1 + Math.sin(t * Math.PI) * 0.05;
      return `transform: rotate(${angle}deg) scale(${scale});`;
    },
  };
}

type RevealParams = {
  duration?: number;
  baseSpeed?: number;
};

export function reveal(
  node: Element,
  { duration = 1200, baseSpeed = 300 }: RevealParams = {}
): TransitionConfig {
  const originalHTML = node.innerHTML;
  const spans: HTMLElement[] = [];

  const overlay = document.createElement("div");
  const nodeStyle = window.getComputedStyle(node);
  const originalChildren = Array.from(node.childNodes).map((n) =>
    n.cloneNode(true)
  );
  overlay.style.display = nodeStyle.display;
  if (
    nodeStyle.display === "block" ||
    nodeStyle.display === "flex" ||
    nodeStyle.display === "grid"
  ) {
    overlay.style.width = "100%";
  }
  overlay.style.flexWrap = "wrap";
  overlay.style.position = "relative";
  overlay.style.whiteSpace = "pre-wrap";
  overlay.style.textAlign = nodeStyle.textAlign;
  overlay.className = (node as HTMLElement).className;

  function cloneWithStyles(element: Element): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement;
    const originalStyle = window.getComputedStyle(element);

    for (const prop of originalStyle) {
      clone.style[prop as any] = originalStyle.getPropertyValue(prop);
    }

    if (element instanceof HTMLElement) {
      clone.className = element.className;
    }

    return clone;
  }

  function wrapTextWithSpans(node: Element, parent: HTMLElement) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const words = (child.textContent || "").split(/(\s+)/);
        words.forEach((word) => {
          if (!word) return;
          if (word.trim() === "") {
            const space = document.createElement("span");
            space.textContent = word;
            space.style.display = "inline-block";
            space.style.whiteSpace = "pre";
            parent.appendChild(space);
          } else {
            const container = document.createElement("span");
            container.style.display = "inline-block";
            container.style.position = "relative";
            container.style.whiteSpace = "pre-wrap";
            for (const char of word) {
              const span = document.createElement("span");
              span.textContent = char;
              span.style.display = "inline-block";
              span.style.position = "relative";
              span.style.opacity = "0";
              span.style.transform = "translateY(20px)";

              container.appendChild(span);
              spans.push(span);
            }
            parent.appendChild(container);
          }
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const clone = document.createElement(el.tagName);
        clone.className = el.className;
        clone.style.cssText = (el as HTMLElement).style.cssText;
        for (const attr of el.getAttributeNames()) {
          if (attr === "style")
            clone.setAttribute("style", el.getAttribute("style")!);
        }
        parent.appendChild(clone);
        wrapTextWithSpans(el, clone);
      }
    });
  }

  overlay.innerHTML = "";
  wrapTextWithSpans(node, overlay);

  node.innerHTML = "";
  node.appendChild(overlay);

  const totalChars = spans.length;
  const stagger =
    totalChars > 1 ? (duration - baseSpeed) / (totalChars - 1) : 0;

  let lastT = 0;

  return {
    duration,
    tick: (t: number) => {
      const isOut = t < 0;
      const absoluteT = Math.abs(t);

      spans.forEach((span, i) => {
        const index = isOut ? spans.length - 1 - i : i;
        const delay = index * stagger;
        const adjustedTime = Math.max(0, duration * absoluteT - delay);
        const progress = Math.min(1, adjustedTime / baseSpeed);
        const eased = isOut ? cubicIn(1 - progress) : cubicOut(progress);
        span.style.opacity = `${eased}`;
        span.style.transform = `translateY(${(1 - eased) * 20}px)`;
      });

      if (lastT > -1 && t <= -1) {
        node.innerHTML = "";
        for (const child of originalChildren)
          node.appendChild(child.cloneNode(true));
      }
      lastT = t;
    },
  };
}

export function revealWords(
  node: Element,
  { duration = 1200, baseSpeed = 300 }: RevealParams = {}
): TransitionConfig {
  const originalHTML = node.innerHTML;
  const spans: HTMLElement[] = [];

  const overlay = document.createElement("div");
  const nodeStyle = window.getComputedStyle(node);
  const originalChildren = Array.from(node.childNodes).map((n) =>
    n.cloneNode(true)
  );
  overlay.style.display = nodeStyle.display;
  if (
    nodeStyle.display === "block" ||
    nodeStyle.display === "flex" ||
    nodeStyle.display === "grid"
  ) {
    overlay.style.width = "100%";
  }
  overlay.style.flexWrap = "wrap";
  overlay.style.position = "relative";
  overlay.style.whiteSpace = "pre-wrap";
  overlay.style.textAlign = nodeStyle.textAlign;
  overlay.className = (node as HTMLElement).className;

  function wrapWords(node: Element, parent: HTMLElement) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const words = (child.textContent || "").split(/(\s+)/);
        words.forEach((word) => {
          const span = document.createElement("span");
          span.textContent = word;
          span.style.display = "inline-block";
          span.style.whiteSpace = "pre";
          span.style.position = "relative";
          span.style.opacity = "0";
          span.style.transform = "translateY(20px)";
          parent.appendChild(span);
          spans.push(span);
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const clone = document.createElement(el.tagName);
        clone.className = el.className;
        clone.style.cssText = el.style.cssText;
        for (const attr of el.getAttributeNames()) {
          if (attr === "style")
            clone.setAttribute("style", el.getAttribute("style")!);
        }
        parent.appendChild(clone);
        wrapWords(el, clone);
      }
    });
  }

  overlay.innerHTML = "";
  wrapWords(node, overlay);

  node.innerHTML = "";
  node.appendChild(overlay);

  const totalWords = spans.length;
  const stagger =
    totalWords > 1 ? (duration - baseSpeed) / (totalWords - 1) : 0;

  let lastT = 0;

  return {
    duration,
    tick: (t: number) => {
      const isOut = t < 0;
      const absoluteT = Math.abs(t);

      spans.forEach((span, i) => {
        const index = isOut ? spans.length - 1 - i : i;
        const delay = index * stagger;
        const adjustedTime = Math.max(0, duration * absoluteT - delay);
        const progress = Math.min(1, adjustedTime / baseSpeed);
        const eased = isOut ? cubicIn(1 - progress) : cubicOut(progress);
        span.style.opacity = `${eased}`;
        span.style.transform = `translateY(${(1 - eased) * 20}px)`;
      });

      if (lastT > -1 && t <= -1) {
        node.innerHTML = "";
        for (const child of originalChildren)
          node.appendChild(child.cloneNode(true));
      }
      lastT = t;
    },
  };
}

export function focus(node: HTMLElement): { destroy: () => void } {
  node.focus();
  return { destroy: () => {} };
}
