import { Screen } from '../../components/Screen';
import { Box, Text } from '../../theme';
import { AppHeader } from '../header/AppHeader';

/** Agenda. O Header é real; o conteúdo (M4) é a Tarefa 11. */
export function LessonsScreen() {
  return (
    <Screen testID="agenda-screen">
      <AppHeader>
        <Box padding="xxxl" alignItems="center">
          <Text variant="body" textAlign="center">
            As aulas do dia entram aqui.
          </Text>
        </Box>
      </AppHeader>
    </Screen>
  );
}
