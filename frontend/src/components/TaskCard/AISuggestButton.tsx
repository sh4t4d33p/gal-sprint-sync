import { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { suggestDescriptionAI } from '../../utils/api';

interface AISuggestButtonProps {
  title: string;
  onSuggestion: (desc: string) => void;
  disabled?: boolean;
}

export default function AISuggestButton({ title, onSuggestion, disabled }: AISuggestButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const suggestion = await suggestDescriptionAI(title);
      onSuggestion(suggestion);
    } catch (err) {
      onSuggestion('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Suggest description with AI">
      <span>
        <IconButton
          onClick={handleClick}
          disabled={disabled || !title.trim() || loading}
          size="medium"
          sx={{
            background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 50%, #7ee8fa 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px 0 rgba(255, 204, 51, 0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            '&:hover': {
              background: 'linear-gradient(90deg, #7ee8fa 0%, #eec0c6 100%)',
              color: '#fff',
              transform: 'scale(1.15)',
              boxShadow: '0 4px 16px 0 rgba(126, 232, 250, 0.25)',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon fontSize="medium" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
