import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? '50%' : '4px',
  };

  const classes = [
    'animate-pulse bg-[#eeeef1] rounded',
    circle ? 'rounded-full' : 'rounded',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes} style={style} />;
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden">
      <Skeleton height="200px" className="rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton width="60%" height="1.25rem" />
        <Skeleton width="40%" height="1rem" />
        <Skeleton width="80%" height="1rem" />
      </div>
    </div>
  );
};
