import { requireBasicAuth, unauthorizedResponse } from '../_lib/basicAuth.js';

// Basic Auth for everything under /dashboard/* (leads, competitors, status API).
export async function onRequest(context) {
  if (!(await requireBasicAuth(context.request))) {
    return unauthorizedResponse();
  }
  return context.next();
}
