import MasonryLayout from "react-masonry-css";

interface MasonryProps {
  children: React.ReactNode;
  className?: string;
  breakpointCols?: {
    default: number;
    [key: number]: number;
  };
}

export function Masonry({
  children,
  className = "",
  breakpointCols = {
    default: 4,
    1536: 3,
    1280: 3,
    1024: 2,
    768: 2,
    640: 1,
  },
}: MasonryProps) {
  return (
    <MasonryLayout
      breakpointCols={breakpointCols}
      className={`-ml-6 w-auto flex ${className}`}
      columnClassName="pl-6 bg-clip-padding"
    >
      {children}
    </MasonryLayout>
  );
}
