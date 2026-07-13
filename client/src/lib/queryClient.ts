import { QueryClient } from '@tanstack/react-query';

// Centralna konfiguracja klienta React Query z domyślnymi ustawieniami dla całej aplikacji
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Dane są "świeże" przez 5 minut
      retry: 1, // Jedna próba ponowienia w przypadku błędu
    },
  },
});
