import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTickets,
  updateTicket,
  getAssetsForUser,
  getTicketHistory,
  getRelatedItems,
} from '../lib/api';
import type { TicketHistoryEntry } from '../types';
import { CosmoAssistant } from '../components/CosmoAssistant';

export const DeepWorkPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [activeTab, setActiveTab] = useState<'timeline' | 'related' | 'assets'>('timeline');

  const { data, refetch } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTickets({ ticketId: ticketId! }).then((t) => t[0]),
    enabled: !!ticketId,
  });
  const { data: assets = [] } = useQuery({
    queryKey: ['ticketAssets', data?.requestedBy.id],
    queryFn: () => getAssetsForUser(data!.requestedBy.id.toString()),
    enabled: !!data,
  });
  const { data: history = [] } = useQuery({
    queryKey: ['ticketHistory', ticketId],
    queryFn: () => getTicketHistory(ticketId!),
    enabled: !!ticketId,
  });
  const { data: related } = useQuery({
    queryKey: ['ticketRelated', ticketId],
    queryFn: () => getRelatedItems(ticketId!),
    enabled: !!ticketId,
  });
  const [note, setNote] = React.useState('');
  const [status, setStatus] = React.useState<string>();

  if (!data) return <div>Loading...</div>;

  React.useEffect(() => {
    setStatus(data.status);
  }, [data.status]);

  const handleUpdate = async () => {
    await updateTicket(ticketId!, { workNote: note });
    setNote('');
    refetch();
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] });
  };

  const handleStatusSave = async () => {
    if (!status || status === data.status) return;
    await updateTicket(ticketId!, { status });
    refetch();
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] });
  };

  const toggleSla = async () => {
    const newStatus = data.status === 'on_hold' ? 'in_progress' : 'on_hold';
    await updateTicket(ticketId!, { status: newStatus });
    refetch();
    queryClient.invalidateQueries({ queryKey: ['ticketHistory', ticketId] });
  };

  const updateTabAria = React.useCallback(() => {
    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach((t) => {
      const id = t.getAttribute('id');
      if (!id) return;
      const selected = id === `tab-${activeTab}`;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.setAttribute('tabindex', selected ? '0' : '-1');
    });
  }, [activeTab]);
  React.useEffect(() => {
    updateTabAria();
  }, [updateTabAria]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{data.title}</h2>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-2 py-1"
          aria-label="Change ticket status"
        >
          {['open', 'in_progress', 'on_hold', 'resolved', 'closed'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onClick={handleStatusSave}
        >
          Save
        </button>
        <button
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          onClick={toggleSla}
        >
          {data.status === 'on_hold' ? 'Resume SLA' : 'Pause SLA'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="mb-1 font-semibold">Requestor</h3>
          <p>{data.requestedBy.name}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold">Linked Assets</h3>
          {assets.length === 0 ? (
            <p className="text-muted-foreground text-sm">None</p>
          ) : (
            <ul className="list-disc pl-5 text-sm">
              {assets.map((a) => (
                <li key={a.id}>
                  {a.name} ({a.assetTag || 'n/a'})
                </li>
              ))}
            </ul>
          )}
        </div>
        <CosmoAssistant />
      </div>

      <div className="rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" role="tablist">
            <button
              type="button"
              id="tab-timeline"
              aria-controls="panel-timeline"
              aria-selected="false"
              // aria-selected updated via effect
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('timeline')}
              role="tab"
            >
              Timeline
            </button>
            <button
              type="button"
              id="tab-related"
              aria-controls="panel-related"
              aria-selected="false"
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'related'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('related')}
              role="tab"
            >
              Related
            </button>
            <button
              type="button"
              id="tab-assets"
              aria-controls="panel-assets"
              aria-selected="false"
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assets')}
              role="tab"
            >
              Assets
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'timeline' && (
            <div role="tabpanel" id="panel-timeline" aria-labelledby="tab-timeline">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {history.map((h: TicketHistoryEntry, i: number) => (
                  <li key={i}>
                    {new Date(h.timestamp).toLocaleString()} - {h.user}: {h.action}{' '}
                    {h.details ? `- ${h.details}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'related' && (
            <div
              role="tabpanel"
              id="panel-related"
              aria-labelledby="tab-related"
              className="space-y-4 text-sm"
            >
              <div>
                <h4 className="font-semibold">Related Tickets</h4>
                <ul className="list-disc pl-5">
                  {(related?.tickets || []).map((t) => (
                    <li key={t.ticketId}>
                      {t.title} ({t.status})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Org Assets</h4>
                <ul className="list-disc pl-5">
                  {(related?.assets || []).map((a) => (
                    <li key={a.id}>
                      {a.name} ({a.assetTag || 'n/a'})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div role="tabpanel" id="panel-assets" aria-labelledby="tab-assets">
              <ul className="list-disc pl-5 text-sm">
                {assets.map((a) => (
                  <li key={a.id}>
                    {a.name} ({a.assetTag || 'n/a'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border"
        placeholder="Add your work notes here..."
        aria-label="Work notes"
      />
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        onClick={handleUpdate}
      >
        Add Note
      </button>
    </div>
  );
};
