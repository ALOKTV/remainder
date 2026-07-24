import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleProp, Text, View, ViewStyle } from 'react-native';
import { styles } from './AppIcon.styles';

type AppIconProps = {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
};

type IconShapeProps = {
  size: number;
  color: string;
  stroke: number;
  filled: boolean;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function AppIcon({ name, size = 24, color, style }: AppIconProps) {
  const normalized = name.replace(/-outline$/, '');
  const filled = !name.endsWith('-outline');
  const stroke = Math.max(2, Math.round(size / 12));
  const ioniconName = getIoniconName(name);

  return (
    <View style={[styles.root, { width: size, height: size }, style]} pointerEvents="none">
      {Platform.OS === 'web' && ioniconName ? <Ionicons name={ioniconName} size={size} color={color} /> : renderIcon(normalized, { size, color, stroke, filled })}
    </View>
  );
}

function getIoniconName(name: string): IoniconName | null {
  const outline = name.endsWith('-outline');
  const normalized = name.replace(/-outline$/, '');

  switch (normalized) {
    case 'add':
      return 'add';
    case 'book':
      return outline ? 'book-outline' : 'book';
    case 'calendar':
      return outline ? 'calendar-outline' : 'calendar';
    case 'checkbox':
      return outline ? 'checkbox-outline' : 'checkbox';
    case 'checkmark':
      return 'checkmark';
    case 'checkmark-circle':
      return outline ? 'checkmark-circle-outline' : 'checkmark-circle';
    case 'checkmark-done-circle':
      return outline ? 'checkmark-done-circle-outline' : 'checkmark-done-circle';
    case 'chevron-down':
      return 'chevron-down';
    case 'chevron-up':
      return 'chevron-up';
    case 'close':
      return 'close';
    case 'create':
    case 'pencil':
      return 'create-outline';
    case 'document-text':
      return outline ? 'document-text-outline' : 'document-text';
    case 'notifications':
      return outline ? 'notifications-outline' : 'notifications';
    case 'notifications-off':
      return outline ? 'notifications-off-outline' : 'notifications-off';
    case 'planet':
      return outline ? 'planet-outline' : 'planet';
    case 'search':
      return 'search';
    case 'settings':
      return outline ? 'settings-outline' : 'settings';
    case 'square':
      return outline ? 'square-outline' : 'square';
    case 'time':
      return outline ? 'time-outline' : 'time';
    default:
      return null;
  }
}

function renderIcon(name: string, props: IconShapeProps) {
  switch (name) {
    case 'add':
      return <PlusIcon {...props} />;
    case 'book':
      return <BookIcon {...props} />;
    case 'calendar':
      return <CalendarIcon {...props} />;
    case 'checkbox':
    case 'checkmark-done-circle':
      return <CheckboxIcon {...props} checked />;
    case 'checkmark':
      return <CheckIcon {...props} />;
    case 'checkmark-circle':
      return <CheckCircleIcon {...props} />;
    case 'chevron-down':
      return <ChevronIcon {...props} direction="down" />;
    case 'chevron-up':
      return <ChevronIcon {...props} direction="up" />;
    case 'close':
      return <CloseIcon {...props} />;
    case 'create':
    case 'pencil':
      return <PencilIcon {...props} />;
    case 'document-text':
      return <DocumentIcon {...props} />;
    case 'notifications':
      return <NotificationIcon {...props} disabled={false} />;
    case 'notifications-off':
      return <NotificationIcon {...props} disabled />;
    case 'planet':
      return <PlanetIcon {...props} />;
    case 'search':
      return <SearchIcon {...props} />;
    case 'settings':
      return <SettingsIcon {...props} />;
    case 'square':
      return <CheckboxIcon {...props} checked={false} />;
    case 'time':
      return <TimeIcon {...props} />;
    default:
      return <FallbackIcon size={props.size} color={props.color} />;
  }
}

function PlusIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.line, { width: size * 0.58, height: stroke, left: size * 0.21, top: (size - stroke) / 2, backgroundColor: color }]} />
      <View style={[styles.line, { width: stroke, height: size * 0.58, left: (size - stroke) / 2, top: size * 0.21, backgroundColor: color }]} />
    </>
  );
}

function SearchIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.circle, { width: size * 0.58, height: size * 0.58, borderRadius: size * 0.29, borderWidth: stroke, borderColor: color, left: size * 0.12, top: size * 0.12 }]} />
      <View style={[styles.line, { width: size * 0.34, height: stroke, left: size * 0.59, top: size * 0.68, backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
    </>
  );
}

function CheckIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.line, { width: size * 0.2, height: stroke, left: size * 0.25, top: size * 0.55, backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.line, { width: size * 0.46, height: stroke, left: size * 0.38, top: size * 0.49, backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
    </>
  );
}

function CheckCircleIcon({ size, color, stroke, filled }: IconShapeProps) {
  const iconColor = filled ? '#ffffff' : color;
  return (
    <>
      <View style={[styles.circle, { width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41, borderWidth: stroke, borderColor: color, backgroundColor: filled ? color : 'transparent', left: size * 0.09, top: size * 0.09 }]} />
      <CheckIcon size={size} color={iconColor} stroke={stroke} filled={filled} />
    </>
  );
}

function CheckboxIcon({ size, color, stroke, filled, checked }: IconShapeProps & { checked: boolean }) {
  const boxSize = size * 0.72;
  const isFilled = checked && filled;
  return (
    <>
      <View style={[styles.box, { width: boxSize, height: boxSize, borderRadius: size * 0.14, borderWidth: stroke, borderColor: color, backgroundColor: isFilled ? color : 'transparent', left: size * 0.14, top: size * 0.14 }]} />
      {checked ? <CheckIcon size={size} color={isFilled ? '#ffffff' : color} stroke={stroke} filled={filled} /> : null}
    </>
  );
}

function CalendarIcon({ size, color, stroke, filled }: IconShapeProps) {
  const lineColor = filled ? '#ffffff' : color;
  return (
    <>
      <View style={[styles.box, { width: size * 0.76, height: size * 0.7, borderRadius: size * 0.1, borderWidth: stroke, borderColor: color, backgroundColor: filled ? color : 'transparent', left: size * 0.12, top: size * 0.18 }]} />
      <View style={[styles.line, { width: size * 0.76, height: stroke, left: size * 0.12, top: size * 0.38, backgroundColor: lineColor }]} />
      <View style={[styles.line, { width: stroke, height: size * 0.2, left: size * 0.3, top: size * 0.08, backgroundColor: color }]} />
      <View style={[styles.line, { width: stroke, height: size * 0.2, left: size * 0.68, top: size * 0.08, backgroundColor: color }]} />
      <View style={[styles.dot, { width: stroke * 1.2, height: stroke * 1.2, left: size * 0.3, top: size * 0.52, backgroundColor: lineColor }]} />
      <View style={[styles.dot, { width: stroke * 1.2, height: stroke * 1.2, left: size * 0.48, top: size * 0.52, backgroundColor: lineColor }]} />
      <View style={[styles.dot, { width: stroke * 1.2, height: stroke * 1.2, left: size * 0.66, top: size * 0.52, backgroundColor: lineColor }]} />
    </>
  );
}

function TimeIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.circle, { width: size * 0.78, height: size * 0.78, borderRadius: size * 0.39, borderWidth: stroke, borderColor: color, left: size * 0.11, top: size * 0.11 }]} />
      <View style={[styles.line, { width: stroke, height: size * 0.25, left: (size - stroke) / 2, top: size * 0.27, backgroundColor: color }]} />
      <View style={[styles.line, { width: size * 0.22, height: stroke, left: size * 0.49, top: size * 0.5, backgroundColor: color }]} />
    </>
  );
}

function DocumentIcon({ size, color, stroke, filled }: IconShapeProps) {
  const lineColor = filled ? '#ffffff' : color;
  return (
    <>
      <View style={[styles.box, { width: size * 0.62, height: size * 0.78, borderRadius: size * 0.08, borderWidth: stroke, borderColor: color, backgroundColor: filled ? color : 'transparent', left: size * 0.19, top: size * 0.11 }]} />
      <View style={[styles.line, { width: size * 0.34, height: stroke, left: size * 0.33, top: size * 0.38, backgroundColor: lineColor }]} />
      <View style={[styles.line, { width: size * 0.34, height: stroke, left: size * 0.33, top: size * 0.53, backgroundColor: lineColor }]} />
      <View style={[styles.line, { width: size * 0.23, height: stroke, left: size * 0.33, top: size * 0.68, backgroundColor: lineColor }]} />
    </>
  );
}

function BookIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.box, { width: size * 0.68, height: size * 0.76, borderRadius: size * 0.08, borderWidth: stroke, borderColor: color, left: size * 0.16, top: size * 0.12 }]} />
      <View style={[styles.line, { width: stroke, height: size * 0.72, left: size * 0.36, top: size * 0.14, backgroundColor: color }]} />
      <View style={[styles.line, { width: size * 0.18, height: stroke, left: size * 0.48, top: size * 0.34, backgroundColor: color }]} />
      <View style={[styles.line, { width: size * 0.18, height: stroke, left: size * 0.48, top: size * 0.5, backgroundColor: color }]} />
    </>
  );
}

function SettingsIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.line, { width: size * 0.72, height: stroke, left: size * 0.14, top: size * 0.28, backgroundColor: color }]} />
      <View style={[styles.line, { width: size * 0.72, height: stroke, left: size * 0.14, top: size * 0.5, backgroundColor: color }]} />
      <View style={[styles.line, { width: size * 0.72, height: stroke, left: size * 0.14, top: size * 0.72, backgroundColor: color }]} />
      <View style={[styles.knob, { width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, left: size * 0.24, top: size * 0.28 - size * 0.09 + stroke / 2, backgroundColor: color }]} />
      <View style={[styles.knob, { width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, left: size * 0.58, top: size * 0.5 - size * 0.09 + stroke / 2, backgroundColor: color }]} />
      <View style={[styles.knob, { width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, left: size * 0.38, top: size * 0.72 - size * 0.09 + stroke / 2, backgroundColor: color }]} />
    </>
  );
}

function PencilIcon({ size, color, stroke }: IconShapeProps) {
  const bodyWidth = size * 0.54;
  const bodyHeight = Math.max(stroke * 2.3, size * 0.12);
  return (
    <>
      <View style={[styles.line, { width: bodyWidth, height: bodyHeight, left: size * 0.24, top: size * 0.43, backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
      <View style={[styles.box, { width: size * 0.16, height: size * 0.16, borderLeftWidth: stroke, borderBottomWidth: stroke, borderColor: color, left: size * 0.18, top: size * 0.66, transform: [{ rotate: '-45deg' }] }]} />
      <View style={[styles.box, { width: size * 0.16, height: bodyHeight, borderRadius: bodyHeight / 2, left: size * 0.68, top: size * 0.24, backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
    </>
  );
}

function NotificationIcon({ size, color, stroke, disabled }: IconShapeProps & { disabled: boolean }) {
  return (
    <>
      <View style={[styles.bellDome, { width: size * 0.54, height: size * 0.5, borderTopLeftRadius: size * 0.27, borderTopRightRadius: size * 0.27, borderWidth: stroke, borderBottomWidth: 0, borderColor: color, left: size * 0.23, top: size * 0.2 }]} />
      <View style={[styles.line, { width: size * 0.7, height: stroke, left: size * 0.15, top: size * 0.68, backgroundColor: color }]} />
      <View style={[styles.dot, { width: size * 0.16, height: size * 0.16, borderRadius: size * 0.08, left: size * 0.42, top: size * 0.74, backgroundColor: color }]} />
      {disabled ? <CloseIcon size={size} color={color} stroke={Math.max(2, stroke)} filled={false} /> : null}
    </>
  );
}

function ChevronIcon({ size, color, stroke, direction }: IconShapeProps & { direction: 'up' | 'down' }) {
  return (
    <View style={[styles.chevron, { width: size * 0.42, height: size * 0.42, borderRightWidth: stroke, borderBottomWidth: stroke, borderColor: color, left: size * 0.29, top: direction === 'down' ? size * 0.18 : size * 0.36, transform: [{ rotate: direction === 'down' ? '45deg' : '-135deg' }] }]} />
  );
}

function CloseIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.line, { width: size * 0.62, height: stroke, left: size * 0.19, top: (size - stroke) / 2, backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.line, { width: size * 0.62, height: stroke, left: size * 0.19, top: (size - stroke) / 2, backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
    </>
  );
}

function PlanetIcon({ size, color, stroke }: IconShapeProps) {
  return (
    <>
      <View style={[styles.circle, { width: size * 0.54, height: size * 0.54, borderRadius: size * 0.27, borderWidth: stroke, borderColor: color, left: size * 0.23, top: size * 0.23 }]} />
      <View style={[styles.ring, { width: size * 0.8, height: size * 0.24, borderRadius: size * 0.12, borderWidth: stroke, borderColor: color, left: size * 0.1, top: size * 0.4, transform: [{ rotate: '-18deg' }] }]} />
    </>
  );
}

function FallbackIcon({ size, color }: { size: number; color: string }) {
  return <Text style={[styles.fallback, { color, fontSize: size * 0.75, lineHeight: size }]}>?</Text>;
}
