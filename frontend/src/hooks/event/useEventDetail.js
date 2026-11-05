import { useCallback, useEffect, useMemo, useState } from "react";
import { apiError, eventsApi } from "../../api/eventsApi";

/**
 * Loads one event for the detail page: the event, its partners, the current
 * user's status for it, and their team if they have one.
 *
 * Actions run the API call, then reload the data. Failures land in actionError.
 */
export default function useEventDetail(eventId) {
  const [state, setState] = useState({
    event: null,
    partners: [],
    me: null,
    teamDetail: null,
    loading: true,
    error: null,
  });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [{ event, partners }, me] = await Promise.all([
        eventsApi.getEvent(eventId),
        eventsApi.getMyStatus(eventId),
      ]);
      const teamDetail = me.team ? await eventsApi.getTeam(me.team._id) : null;
      setState({ event, partners, me, teamDetail, loading: false, error: null });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: apiError(err) }));
    }
  }, [eventId]);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    load();
  }, [load]);

  const run = useCallback(
    async (fn) => {
      setBusy(true);
      setActionError(null);
      try {
        await fn();
        await load();
      } catch (err) {
        setActionError(apiError(err));
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const actions = useMemo(() => {
    const teamId = state.me?.team?._id;
    return {
      register: () => run(() => eventsApi.register(eventId)),
      withdraw: () => run(() => eventsApi.withdraw(eventId)),
      createTeam: (name) => run(() => eventsApi.createTeam(eventId, name)),
      inviteToTeam: (email) => run(() => eventsApi.inviteToTeam(teamId, email)),
      revokeInvite: (inviteId) => run(() => eventsApi.revokeInvite(inviteId)),
      respondInvite: (inviteId, accept) => run(() => eventsApi.respondInvite(inviteId, accept)),
      leaveTeam: () => run(() => eventsApi.leaveTeam(teamId)),
      lockTeam: () => run(() => eventsApi.lockTeam(teamId)),
      disbandTeam: () => run(() => eventsApi.disbandTeam(teamId)),
    };
  }, [eventId, run, state.me]);

  return { ...state, busy, actionError, actions };
}