interface Props {
  children: React.ReactNode;
}

export const ContentContainer = ({ children }: Props) => (
  <div className="flex min-h-screen flex-col pt-[73px]">{children}</div>
);
