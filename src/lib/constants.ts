import { format } from 'date-fns';

export const DEFAULT_NOTE_TITLE = format(new Date(), "'Note taken on' MMMM dd, yyyy 'at' HH:mm");
