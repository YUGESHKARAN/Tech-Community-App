// What the current user can manage in events. Controls which sidebar sections show.
//
// TODO: replace the mock with a real call once the API exposes roles, for example
// GET /bytes/manage/events/me/roles → { isOrganizer, canJudge }.
const MOCK_VIEWER = { isOrganizer: true, canJudge: true };

export default function useEventsViewer() {
  return MOCK_VIEWER;
}