import { TicketExecutionDashboard } from '@/components/tickets/TicketExecutionDashboard';
import { cloudTrailExecutionMock } from '@/lib/cloudTrailExecutionMock';

export default function CloudTrailDashboardDebugPage() {
  return <TicketExecutionDashboard data={cloudTrailExecutionMock} />;
}
