import React, { useState, useRef } from 'react';
import { Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Popper, ClickAwayListener, ListItemButton, useTheme } from '@mui/material';
import { publicService, UserSuggestion } from '../../services/publicService';

interface TaggableTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TaggableTextarea({ value, onChange, placeholder, rows = 4 }: TaggableTextareaProps) {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = useTheme();

  // Hitta @ och text efter
  const getTagQuery = (text: string, caretPos: number) => {
    const before = text.slice(0, caretPos);
    const match = before.match(/@([\wåäöÅÄÖ]*)$/i);
    if (match) {
      return match[1];
    }
    return null;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    const caretPos = e.target.selectionStart;
    const query = getTagQuery(text, caretPos);
    if (query !== null && query.length > 0) {
      setAnchorEl(e.target);
      setLoading(true);
      try {
        const users = await publicService.searchUsers(query);
        setSuggestions(users);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user: UserSuggestion) => {
    if (!textareaRef.current) return;
    const caretPos = textareaRef.current.selectionStart;
    const before = value.slice(0, caretPos);
    const after = value.slice(caretPos);
    const match = before.match(/@([\wåäöÅÄÖ]*)$/i);
    if (match) {
      const start = match.index ?? 0;
      const newText =
        before.slice(0, start) +
        `@${user.username} ` +
        after;
      onChange(newText);
      setShowSuggestions(false);
      // Sätt caret efter insatt username
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + user.username.length + 2;
        }
      }, 0);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150); // Låt klick hinna registreras
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          resize: 'vertical',
          fontSize: 16,
          padding: 8,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          transition: 'background 0.2s, color 0.2s',
        }}
      />
      <Popper open={showSuggestions && suggestions.length > 0} anchorEl={anchorEl} placement="bottom-start" style={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
          <Paper sx={{ minWidth: 220, maxHeight: 240, overflowY: 'auto' }}>
            <List dense>
              {loading ? (
                <ListItem>Letar...</ListItem>
              ) : (
                suggestions.map((user) => (
                  <ListItemButton key={user.id} onClick={() => handleSuggestionClick(user)}>
                    <ListItemAvatar>
                      <Avatar src={user.image_url}>{user.username.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`@${user.username}`} secondary={user.name} />
                  </ListItemButton>
                ))
              )}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
} 