import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Minimal stub of the new ticket page to validate user flow contract
function NewTicketPage() {
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <main>
      <h1>Create Ticket</h1>
      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <input aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            aria-label="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div role="status">Submitted</div>
      )}
    </main>
  );
}

describe('Tickets user flow (smoke)', () => {
  it('allows a user to create a ticket', () => {
    render(<NewTicketPage />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Laptop issue' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Does not boot' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Submitted');
  });
});
