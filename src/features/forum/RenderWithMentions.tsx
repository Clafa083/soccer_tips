import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

interface UserRef {
  username: string;
  id: number;
}

interface RenderWithMentionsProps {
  text: string;
  users?: UserRef[];
  external?: boolean; // Om true, länka till extern domän
}

export function RenderWithMentions({ text, users, external }: RenderWithMentionsProps) {
  // Bygg en lookup för snabba id-slagningar
  const userMap = users ? Object.fromEntries(users.map(u => [u.username.toLowerCase(), u.id])) : {};
  // Regex: matcha @användarnamn (bokstäver, siffror, åäö)
  const regex = /@([\wåäöÅÄÖ]+)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    const username = match[1];
    const userId = userMap[username.toLowerCase()];
    let url = userId
      ? (external
        ? `https://familjenfalth.se/eankbt/user/${userId}`
        : `/user/${userId}`)
      : undefined;
    if (url) {
      parts.push(
        <Link
          key={start}
          href={url}
          component={external ? 'a' : RouterLink}
          to={external ? undefined : url}
          target={external ? '_blank' : undefined}
          underline="hover"
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          @{username}
        </Link>
      );
    } else {
      parts.push(text.slice(start, end));
    }
    lastIndex = end;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
} 