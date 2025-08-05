export interface Team {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
}

export const teams: Team[] = [
  {
    id: 'cloud',
    name: 'Cloud Team',
    colors: {
      primary: '#3B82F6', // Blue
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#EFF6FF',
      text: '#1E3A8A',
      border: '#BFDBFE'
    }
  },
  {
    id: 'perplexity',
    name: 'Perplexity Team',
    colors: {
      primary: '#8B5CF6', // Purple
      secondary: '#7C3AED',
      accent: '#A78BFA',
      background: '#F3F4F6',
      text: '#5B21B6',
      border: '#C4B5FD'
    }
  },
  {
    id: 'openai',
    name: 'OpenAI Team',
    colors: {
      primary: '#10B981', // Green
      secondary: '#059669',
      accent: '#34D399',
      background: '#ECFDF5',
      text: '#047857',
      border: '#A7F3D0'
    }
  },
  {
    id: 'notion',
    name: 'Notion Team',
    colors: {
      primary: '#000000', // Black
      secondary: '#374151',
      accent: '#6B7280',
      background: '#F9FAFB',
      text: '#111827',
      border: '#D1D5DB'
    }
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Team',
    colors: {
      primary: '#F59E0B', // Orange/Amber
      secondary: '#D97706',
      accent: '#FBBF24',
      background: '#FFFBEB',
      text: '#92400E',
      border: '#FDE68A'
    }
  }
];

export const getTeamById = (id: string): Team | undefined => {
  return teams.find(team => team.id === id);
};