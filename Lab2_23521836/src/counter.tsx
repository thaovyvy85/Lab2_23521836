// src/counter.tsx
/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
import "./counter.css";

// ---- Button ----
interface ButtonProps {
  onClick?: (e: MouseEvent) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  children?: any;
}

const Button = ({
  onClick,
  className,
  type = "button",
  children,
}: ButtonProps) => {
  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
};

// ---- Counter ----
interface CounterProps {
  initialCount?: number;
  className?: string;
}

const Counter = ({ initialCount = 0, className }: CounterProps) => {
  // useState from your runtime returns [getter, setter]
  const [getCount, setCount] = useState<number>(initialCount);

  const increment = () => setCount(getCount + 1);
  const decrement = () => setCount(getCount - 1);
  const reset = () => setCount(initialCount);

  return (
    <div className={className ?? "counter"}>
      <h2>Count: {getCount}</h2>

      <div className="buttons">
        <Button className="btn increment" onClick={increment}>
          +
        </Button>
        <Button className="btn decrement" onClick={decrement}>
          -
        </Button>
        <Button className="btn reset" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export { Counter };
