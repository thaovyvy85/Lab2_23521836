export interface VNode {
  type: string | ComponentFunction;
  props: Record<string, any> | null;
  children: (VNode | string | number)[];
}

export type ComponentFunction = (props: Record<string, any>) => VNode;

let ROOT_CONTAINER: HTMLElement | null = null;
let ROOT_VNODE: VNode | null = null;

export function createElement(
  type: string | ComponentFunction,
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  const flat = children.flat().filter((c) => c !== null && c !== undefined);
  return {
    type,
    props: props || {},
    children: flat
  };
}

export function createFragment(
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  return createElement("fragment", props, ...children);
}

function setAttributes(el: Element, props: Record<string, any>) {
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "children") continue;
    if (k === "className") {
      el.setAttribute("class", String(v));
    } else if (k === "style") {
      if (typeof v === "string") {
        el.setAttribute("style", v);
      } else if (typeof v === "object") {
        const styleString = Object.entries(v)
          .map(([key, val]) => `${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}:${val}`)
          .join(";");
        el.setAttribute("style", styleString);
      }
    } else if (k === "ref" && typeof v === "function") {
    } else if (k.startsWith("on") && typeof v === "function") {
      (el as any)[k] = v;
      const eventName = k.substring(2).toLowerCase();
      el.addEventListener(eventName, v as EventListener);
    } else if (typeof v === "boolean") {
      if (v) el.setAttribute(k, "");
      else el.removeAttribute(k);
    } else {
      el.setAttribute(k, String(v));
    }
  }
}

export function renderToDOM(vnode: VNode | string | number): Node {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  if ((vnode as VNode).type === "fragment") {
    const frag = document.createDocumentFragment();
    for (const c of vnode.children) frag.appendChild(renderToDOM(c));
    return frag;
  }

  if (typeof vnode.type === "function") {
    const comp = vnode.type as ComponentFunction;
    const rendered = comp({ ...(vnode.props || {}), children: vnode.children });
    return renderToDOM(rendered);
  }

  const el = document.createElement(vnode.type as string);

  setAttributes(el, vnode.props || {});

  for (const child of vnode.children) {
    el.appendChild(renderToDOM(child));
  }

  if (vnode.props && typeof vnode.props.ref === "function") {
    try { vnode.props.ref(el); } catch (e) { console.warn("ref callback error", e); }
  }

  return el;
}

function rerenderRoot() {
  if (!ROOT_VNODE || !ROOT_CONTAINER) return;
  ROOT_CONTAINER.innerHTML = "";
  ROOT_CONTAINER.appendChild(renderToDOM(ROOT_VNODE));
}

let hooks: any[] = [];
let hookIndex = 0;

export function mount(vnode: VNode, container: HTMLElement): void {
  ROOT_VNODE = vnode;
  ROOT_CONTAINER = container;
  rerender();
}

function beginRenderCycle() {
  hookIndex = 0;
}

function rerender() {
  if (!ROOT_VNODE || !ROOT_CONTAINER) return;
  ROOT_CONTAINER.innerHTML = "";
  beginRenderCycle();
  ROOT_CONTAINER.appendChild(renderToDOM(ROOT_VNODE));
}

export function useState<T>(
  initialValue: T
): [T, (v: T | ((prev: T) => T)) => void] {
  const currentIndex = hookIndex;
  hooks[currentIndex] = hooks[currentIndex] ?? initialValue;

  const set = (newValue: T | ((prev: T) => T)) => {
    const prev = hooks[currentIndex];
    hooks[currentIndex] =
      typeof newValue === "function" ? (newValue as any)(prev) : newValue;
    rerender();
  };

  const value = hooks[currentIndex];
  hookIndex++;
  return [value, set];
}

export function setRootVNode(vnode: VNode) {
  ROOT_VNODE = vnode;
  rerenderRoot();
}

export default {
  createElement,
  createFragment,
  renderToDOM,
  mount,
  useState,
  setRootVNode
};