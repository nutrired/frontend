interface ClientAvatarProps {
  name: string;
  size?: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getColorFromName(name: string): string {
  const colors = [
    '#4a7c59', // forest green
    '#b8860b', // goldenrod
    '#8b7355', // stone brown
    '#c4622d', // terra
    '#3a5880', // slate blue
    '#6b5b95', // purple
    '#88b04b', // greenery
  ];

  const index = hashString(name) % colors.length;
  return colors[index];
}

function getInitials(name: string): string {
  if (!name) return '??';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClientAvatar({ name, size = 40 }: ClientAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
