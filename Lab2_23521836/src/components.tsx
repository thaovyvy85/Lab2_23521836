/** @jsx createElement */
import { createElement } from "./jsx-runtime";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  onClick?: (e: MouseEvent) => void;
  children?: any;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  variant = "primary",
  onClick,
  children,
  className = "",
  type = "button",
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${variant} ${className}`.trim()}
    >
      {children}
    </button>
  );
};

interface InputProps {
  value?: string;
  placeholder?: string;
  onInput?: (e: InputEvent) => void;
  className?: string;
  type?: string;
}

export const Input = ({
  value = "",
  placeholder = "",
  onInput,
  className = "",
  type = "text",
}: InputProps) => {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onInput={onInput as any}
      className={`input ${className}`.trim()}
    />
  );
};

interface CardProps {
  title?: string;
  children?: any;
  className?: string;
}

export const Card = ({ title, children, className = "" }: CardProps) => {
  return (
    <div className={`card ${className}`.trim()}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-body">{children}</div>
    </div>
  );
};

interface BadgeProps {
  text: string;
  color?: "default" | "success" | "warning" | "error";
}

export const Badge = ({ text, color = "default" }: BadgeProps) => {
  return <span className={`badge ${color}`}>{text}</span>;
};
