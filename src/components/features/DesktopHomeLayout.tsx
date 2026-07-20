import DesktopLeftSidebar from './DesktopLeftSidebar';
import DesktopCenterColumn from './DesktopCenterColumn';
import DesktopRightSidebar from './DesktopRightSidebar';

export default function DesktopHomeLayout() {
  return (
    <div className="hidden md:grid grid-cols-[300px_1fr_280px] min-h-screen bg-background">
      <DesktopLeftSidebar />
      <DesktopCenterColumn />
      <DesktopRightSidebar />
    </div>
  );
}
