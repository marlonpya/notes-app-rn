import { useLocalSearchParams } from 'expo-router';

import { NoteEditorScreen } from '@/features/notes/presentation/editor/NoteEditorScreen';

export default function NoteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NoteEditorScreen key={id} noteId={id === 'new' ? null : id} />;
}
