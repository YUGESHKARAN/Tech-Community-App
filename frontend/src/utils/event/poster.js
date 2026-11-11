// Posters are the event's coverKey image, shown at 16:9 (Tailwind `aspect-video`).
const S3_BASE = "https://open-access-blog-image.s3.us-east-1.amazonaws.com/";
import event2 from "../../assets/events/event-slug-16x9.png"
/** Full URL of the event poster, or null if the event has none. */
export const posterUrl = (event) => (event?.coverKey ? `${S3_BASE}${event.coverKey}` : event2);