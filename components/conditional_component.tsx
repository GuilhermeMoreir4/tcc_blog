type IfProps = {
  condition: boolean;
  children: React.ReactElement;
};

export default function If({ condition, children }: IfProps) {
  return condition ? children : null;
}
