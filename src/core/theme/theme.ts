export const theme = {
  colors: {
    // Cores de Fundo (Dominância do Preto e Cinzas bem escuros)
    background: '#121212',      // Fundo principal do app (Preto fosco, amigável para telas OLED)
    surface: '#1E1E1E',         // Fundo de cards, inputs e modais (Cinza escuro)
    surfaceLight: '#2A2A2A',    // Para bordas ou elementos secundários de container

    // Cores de Destaque e Ação (O Vermelho)
    primary: '#E50914',         // Vermelho principal (para botões de ação, cronômetro ativo)
    primaryHover: '#B80710',    // Vermelho mais escuro para estados de clique (opcional)
    secondary: '#FF453A',       // Um vermelho mais vivo/neon para detalhes ou alertas

    // Cores de Texto
    text: '#FFFFFF',            // Texto principal (Alta legibilidade sobre o fundo escuro)
    textSecondary: '#A0A0A0',   // Texto secundário (subtítulos, placeholders de inputs)
    textMuted: '#666666',       // Texto desativado ou detalhes muito sutis

    // Feedbacks de Sistema
    success: '#34C759',         // Verde para "Treino Concluído com Sucesso"
    error: '#FF3B30',           // Vermelho de erro para validações (pode usar o secundário)
  },

  // Escala de Espaçamento baseada no padrão de 8px (Design System clássico)
  spacing: {
    xs: 4,                      // Pequenos ajustes, raio de borda interno
    sm: 8,                      // Gaps entre linhas, paddings pequenos
    md: 16,                     // Espaçamento padrão de telas e paddings de cards
    lg: 24,                     // Margens grandes entre seções
    xl: 32,                     // Espaçamentos de topo ou grandes blocos
    xxl: 48,
  },

  // Arredondamento de bordas (Border Radius)
  borderRadius: {
    sm: 4,
    md: 8,                      // Padrão para cartões e inputs
    lg: 12,                     // Para botões grandes ou modais
    full: 9999,                 // Para botões circulares (tipo o botão do cronômetro)
  }
} as const;

export type Theme = typeof theme;