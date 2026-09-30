import { requireBasicAuth, unauthorizedResponse } from './_lib/basicAuth.js';

export async function onRequest(context) {
  if (!(await requireBasicAuth(context.request, context.env))) {
    return unauthorizedResponse();
  }
  return context.next();
}
