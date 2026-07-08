export const Card = ({ children, as: Tag = 'div', active = false, clickable = false, className = '', ...props }) => (
  <Tag
    className={[
      'bg-surface border rounded-2xl transition-[transform,border-color,background-color,box-shadow] duration-200',
      active ? 'border-accent bg-blue-light' : 'border-border',
      clickable ? 'cursor-pointer hover:border-accent-bright hover:-translate-y-0.5' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </Tag>
);
