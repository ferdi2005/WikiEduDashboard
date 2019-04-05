import {
  CREATE_REPLY,
  FETCH_TICKETS,
  RECEIVE_TICKETS,
  RESOLVE_TICKET,
  SELECT_TICKET,
  SET_MESSAGES_TO_READ,
  SORT_TICKETS,
  TICKET_STATUS_RESOLVED } from '../constants/tickets';
import fetch from 'cross-fetch';

const getCsrf = () => document.querySelector("meta[name='csrf-token']").getAttribute('content');

export const createReply = (body, status) => async (dispatch) => {
  const response = await fetch('/td/tickets/replies', {
    body: JSON.stringify({ ...body, read: true, status }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf()
    },
    method: 'POST'
  });

  const message = await response.json();
  const notificationBody = {
    sender_id: body.sender_id,
    message_id: message.id
  };

  await fetch('/tickets/notify', {
    body: JSON.stringify(notificationBody),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf()
    },
    method: 'POST'
  });

  dispatch({ type: CREATE_REPLY });
};

export const readAllMessages = ticket => async (dispatch) => {
  const unreadMessages = ticket.messages.some(message => !message.read);
  if (!unreadMessages) return false;

  const response = await fetch('/td/read_all_messages', {
    body: JSON.stringify({ ticket_id: ticket.id }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf()
    },
    method: 'PUT'
  });
  const json = await response.json();
  dispatch({ type: SET_MESSAGES_TO_READ, data: json });
};

export const fetchTickets = () => async (dispatch) => {
  dispatch({ type: FETCH_TICKETS });

  const response = await fetch('/td/tickets');
  const json = await response.json();

  dispatch({ type: RECEIVE_TICKETS, data: json.tickets });
};

export const selectTicket = ticket => ({ type: SELECT_TICKET, ticket });

export const fetchTicket = id => async (dispatch) => {
  const response = await fetch(`/td/tickets/${id}`);
  const data = await response.json();
  dispatch(selectTicket(data.ticket));
};

export const sortTickets = key => ({ type: SORT_TICKETS, key });

export const resolveTicket = id => async (dispatch) => {
  const status = TICKET_STATUS_RESOLVED;

  const response = await fetch(`/td/tickets/${id}`, {
    body: JSON.stringify({ status }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf()
    },
    method: 'PATCH'
  });
  const json = await response.json();
  dispatch({ type: RESOLVE_TICKET, id, data: json });
};