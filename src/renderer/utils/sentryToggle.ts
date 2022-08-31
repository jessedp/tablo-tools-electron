import * as Sentry from '@sentry/electron';

export default function SentryToggle(enabled: boolean) {
  let worked = false;
  const hub = Sentry.getCurrentHub();
  if (hub) {
    const client = hub.getClient();
    if (client) {
      client.getOptions().enabled = enabled;
      worked = true;
    } else {
      console.error('Unable to set Sentry reporting value - no client');
    }
  } else {
    console.error('Unable to set Sentry reporting value - no hub');
  }
  return worked;
}
