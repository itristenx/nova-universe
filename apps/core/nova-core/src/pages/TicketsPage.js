import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@heroui/react';
import { MagnifyingGlassIcon, FunnelIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { formatDate, getUrgencyColor, getStatusColor } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const TicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const { addToast } = useToastStore();
    useEffect(() => {
        loadTickets();
    }, []);
    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await api.getLogs();
            setTickets(data);
        }
        catch (error) {
            console.error('Failed to load tickets:', error);
            addToast({
                type: 'error',
                title: 'Error loading tickets',
                description: 'Unable to load support tickets. Please try refreshing the page.',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const deleteTicket = async (id) => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            try {
                await api.deleteLog(id);
                setTickets(tickets.filter(t => t.id !== id));
                addToast({
                    type: 'success',
                    title: 'Ticket deleted',
                    description: 'The ticket has been successfully deleted.',
                });
            }
            catch (error) {
                console.error('Failed to delete ticket:', error);
                addToast({
                    type: 'error',
                    title: 'Failed to delete ticket',
                    description: error.response?.data?.error || 'Unable to delete the ticket. Please try again.',
                });
            }
        }
    };
    const clearAllTickets = async () => {
        if (confirm('Are you sure you want to clear all tickets? This action cannot be undone.')) {
            try {
                await api.clearLogs();
                setTickets([]);
                addToast({
                    type: 'success',
                    title: 'All tickets cleared',
                    description: 'All support tickets have been successfully deleted.',
                });
            }
            catch (error) {
                console.error('Failed to clear tickets:', error);
                addToast({
                    type: 'error',
                    title: 'Failed to clear tickets',
                    description: error.response?.data?.error || 'Unable to clear tickets. Please try again.',
                });
            }
        }
    };
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.name.toLowerCase().includes(search.toLowerCase()) ||
            ticket.email.toLowerCase().includes(search.toLowerCase()) ||
            ticket.title.toLowerCase().includes(search.toLowerCase()) ||
            ticket.system.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || ticket.emailStatus === statusFilter;
        const matchesUrgency = !urgencyFilter || ticket.urgency === urgencyFilter;
        return matchesSearch && matchesStatus && matchesUrgency;
    });
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-start" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Support Tickets"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Manage and track support requests from your kiosks")),
            React.createElement(Button, { variant: "danger", onClick: clearAllTickets, disabled: tickets.length === 0 },
                React.createElement(TrashIcon, { className: "h-4 w-4 mr-2" }),
                "Clear All")),
        React.createElement(Card, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement("div", { className: "relative" },
                    React.createElement(MagnifyingGlassIcon, { className: "h-5 w-5 absolute left-3 top-3 text-gray-400" }),
                    React.createElement(Input, { type: "text", placeholder: "Search tickets...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-10" })),
                React.createElement("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "input", "aria-label": "Filter by status" },
                    React.createElement("option", { value: "" }, "All Statuses"),
                    React.createElement("option", { value: "success" }, "Success"),
                    React.createElement("option", { value: "fail" }, "Failed")),
                React.createElement("select", { value: urgencyFilter, onChange: (e) => setUrgencyFilter(e.target.value), className: "input", "aria-label": "Filter by urgency" },
                    React.createElement("option", { value: "" }, "All Urgencies"),
                    React.createElement("option", { value: "Low" }, "Low"),
                    React.createElement("option", { value: "Medium" }, "Medium"),
                    React.createElement("option", { value: "High" }, "High"),
                    React.createElement("option", { value: "Urgent" }, "Urgent")),
                React.createElement("div", { className: "flex items-center text-sm text-gray-600" },
                    React.createElement(FunnelIcon, { className: "h-4 w-4 mr-1" }),
                    filteredTickets.length,
                    " of ",
                    tickets.length,
                    " tickets"))),
        React.createElement(Card, null, loading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }))) : filteredTickets.length === 0 ? (React.createElement("div", { className: "text-center py-12" },
            React.createElement(DocumentTextIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
            React.createElement("h3", { className: "mt-2 text-sm font-medium text-gray-900" }, "No tickets found"),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, tickets.length === 0 ? 'No support tickets have been submitted yet.' : 'Try adjusting your search or filters.'))) : (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
                React.createElement("thead", { className: "bg-gray-50" },
                    React.createElement("tr", null,
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Ticket"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Contact"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "System"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Urgency"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Status"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Created"),
                        React.createElement("th", { className: "relative px-6 py-3" },
                            React.createElement("span", { className: "sr-only" }, "Actions")))),
                React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, filteredTickets.map((ticket) => (React.createElement("tr", { key: ticket.id, className: "hover:bg-gray-50" },
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-sm font-medium text-gray-900" },
                                "#",
                                ticket.ticketId),
                            React.createElement("div", { className: "text-sm text-gray-500 max-w-xs truncate" }, ticket.title))),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-sm font-medium text-gray-900" }, ticket.name),
                            React.createElement("div", { className: "text-sm text-gray-500" }, ticket.email))),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }, ticket.system),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(ticket.urgency)}` }, ticket.urgency)),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.emailStatus)}` }, ticket.emailStatus)),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, formatDate(ticket.timestamp)),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" },
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => deleteTicket(ticket.id), className: "text-red-600 hover:text-red-900" },
                            React.createElement(TrashIcon, { className: "h-4 w-4" })))))))))))));
};
