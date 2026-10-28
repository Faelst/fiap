import { Screen } from '../../components/Screen';
import { Box, Text } from '../../theme';
import { AppHeader } from '../header/AppHeader';

/** Boletim. O Header é real; o conteúdo (M5) é a Tarefa 12. */
export function ReportCardScreen() {
  return (
    <Screen testID="boletim-screen">
      <AppHeader>
        <Box padding="xxxl" alignItems="center">
          <Text variant="body" textAlign="center">
            Notas e faltas por trimestre entram aqui.
          </Text>
        </Box>
      </AppHeader>
    </Screen>
  );
}
