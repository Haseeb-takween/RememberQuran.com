/**
 * M4 user-data models — import from here in route handlers after
 * `await connectToDatabase()`.
 *
 * Quran text is never stored here; ayahs are referenced by `verseKey` only.
 */
export { User, type UserDocument, type UserModel } from "./User"
export {
  BookmarkCollection,
  type BookmarkCollectionDocument,
  type BookmarkCollectionModel,
} from "./BookmarkCollection"
export {
  Bookmark,
  type BookmarkDocument,
  type BookmarkModel,
} from "./Bookmark"
export {
  Note,
  type NoteDocument,
  type NoteModel,
} from "./Note"
export {
  ProgressEvent,
  type ProgressEventDocument,
  type ProgressEventModel,
} from "./ProgressEvent"
export {
  Goal,
  GOAL_TYPES,
  type GoalType,
  type GoalDocument,
  type GoalModel,
} from "./Goal"
export {
  StreakState,
  type StreakStateDocument,
  type StreakStateModel,
} from "./StreakState"
export {
  MemorisedAyah,
  type MemorisedAyahDocument,
  type MemorisedAyahModel,
} from "./MemorisedAyah"
