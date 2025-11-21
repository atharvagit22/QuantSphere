import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonLoader({ count = 1, height = 120 }) {
  return (
    <div className="space-y-4">
      <Skeleton
        count={count}
        height={height}
        baseColor="#1a1a1a"
        highlightColor="#333"
        borderRadius="0.75rem"
      />
    </div>
  );
}
