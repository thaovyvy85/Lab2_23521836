import type { VNode } from "./jsx-runtime";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    interface Element extends VNode {}
  }
}