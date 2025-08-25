interface TicketAttachmentsProps {
  ticketId: string;
}

export function TicketAttachments({}: TicketAttachmentsProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Attachments</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Ticket attachments will be displayed here
        </p>
      </div>
      <div className="text-center text-gray-500 dark:text-gray-400">No attachments yet</div>
    </div>
  );
}
