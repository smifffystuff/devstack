export default function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-6 w-48 bg-accent rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-accent rounded-full" />
        <div className="h-5 w-20 bg-accent rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-accent rounded" />
        <div className="h-8 w-16 bg-accent rounded" />
        <div className="h-8 w-16 bg-accent rounded" />
        <div className="h-8 w-16 bg-accent rounded" />
      </div>
      <div className="h-px bg-border" />
      <div className="h-4 w-full bg-accent rounded" />
      <div className="h-4 w-3/4 bg-accent rounded" />
      <div className="h-32 w-full bg-accent rounded-lg" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 bg-accent rounded-full" />
        <div className="h-5 w-12 bg-accent rounded-full" />
        <div className="h-5 w-16 bg-accent rounded-full" />
      </div>
    </div>
  );
}
