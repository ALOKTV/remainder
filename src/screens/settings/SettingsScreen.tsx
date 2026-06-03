import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View, Pressable, Modal } from 'react-native';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import { ConfirmDialog, ConfirmDialogConfig } from '../../components/ConfirmDialog';
import { SegmentedControl } from '../../components/SegmentedControl';
import { getDatabaseInfo } from '../../database/database';
import { useThemeColors } from '../../hooks/useThemeColors';
import { requestNotificationPermission } from '../../notifications/notificationService';
import { useSettingsStore } from '../../store/settingsStore';
import { useNoteStore } from '../../store/noteStore';
import { useReminderStore } from '../../store/reminderStore';
import { useTaskStore } from '../../store/taskStore';
import { DatabaseInfo, ThemeMode } from '../../types/models';
import { screenStyles } from '../common/screenStyles';
import { theme as appTheme } from '../../constants/theme';
import { accentColors, AccentColor } from '../../constants/colors';
import { AppIcon } from '../../components/AppIcon';
import { getCurrentSession, signInWithEmail, signOut, signUpWithEmail } from '../../supabase/auth';
import { pullCloudToLocal, pushLocalToCloud } from '../../supabase/sync';
import ColorPicker, { Panel1, HueSlider, Preview } from 'reanimated-color-picker';

export function SettingsScreen() {
  const theme = useThemeColors();
  const settings = useSettingsStore();
  const taskStore = useTaskStore();
  const reminderStore = useReminderStore();
  const noteStore = useNoteStore();
  const isDark = settings.resolvedTheme === 'dark';
  const shadow = isDark ? appTheme.shadows.dark : appTheme.shadows.light;
  
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [dialog, setDialog] = useState<ConfirmDialogConfig | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'theme' | 'background'>('theme');
  const [tempColor, setTempColor] = useState('#ffffff');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState<'push' | 'pull' | null>(null);

  useEffect(() => {
    void getDatabaseInfo().then(setDbInfo);
    void refreshAuthSession();
  }, []);

  async function enableNotifications(enabled: boolean) {
    if (enabled) {
      const granted = await requestNotificationPermission();
      settings.setNotificationsEnabled(granted);
      if (!granted) showInfo('Notifications disabled', 'Notification permission was not granted.');
    } else {
      settings.setNotificationsEnabled(false);
    }
  }

  function showInfo(title: string, message: string) {
    setDialog({ title, message, confirmLabel: 'OK', cancelLabel: null, onConfirm: () => undefined });
  }

  async function refreshAuthSession() {
    try {
      const session = await getCurrentSession();
      setSignedInEmail(session?.user.email ?? null);
    } catch {
      setSignedInEmail(null);
    }
  }

  async function handleAuth(action: 'sign-in' | 'sign-up') {
    if (authLoading) return;
    if (!authEmail.trim() || authPassword.length < 6) {
      showInfo('Cloud Sync', 'Enter an email and a password with at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const result = action === 'sign-in'
        ? await signInWithEmail(authEmail, authPassword)
        : await signUpWithEmail(authEmail, authPassword);
      setSignedInEmail(result.user?.email ?? authEmail.trim());
      setAuthPassword('');
      showInfo('Cloud Sync', action === 'sign-in' ? 'Signed in successfully.' : 'Account created. You are signed in if email confirmation is disabled.');
    } catch (error) {
      showInfo('Cloud Sync Error', error instanceof Error ? error.message : 'Unable to complete authentication.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await signOut();
      setSignedInEmail(null);
      showInfo('Cloud Sync', 'Signed out successfully.');
    } catch (error) {
      showInfo('Cloud Sync Error', error instanceof Error ? error.message : 'Unable to sign out.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handlePushLocal() {
    if (syncLoading) return;
    setSyncLoading('push');
    try {
      const result = await pushLocalToCloud();
      showInfo('Cloud Sync', `Pushed ${result.tasks} tasks, ${result.reminders} reminders, and ${result.notes} notes.`);
    } catch (error) {
      showInfo('Cloud Sync Error', error instanceof Error ? error.message : 'Unable to push local data.');
    } finally {
      setSyncLoading(null);
    }
  }

  async function handlePullCloud() {
    if (syncLoading) return;
    setSyncLoading('pull');
    try {
      const result = await pullCloudToLocal();
      await Promise.all([taskStore.load(), reminderStore.load(), noteStore.load(), getDatabaseInfo().then(setDbInfo)]);
      showInfo('Cloud Sync', `Pulled ${result.tasks} tasks, ${result.reminders} reminders, and ${result.notes} notes.`);
    } catch (error) {
      showInfo('Cloud Sync Error', error instanceof Error ? error.message : 'Unable to pull cloud data.');
    } finally {
      setSyncLoading(null);
    }
  }

  function changeThemeMode(mode: ThemeMode) {
    settings.setThemeMode(mode);
    showInfo('Settings Saved', `Appearance changed to ${mode} mode.`);
  }

  function changeAccentColor(colorKey: AccentColor) {
    settings.setAccentColor(colorKey);
    showInfo('Settings Saved', `Theme color updated successfully.`);
  }

  return (
    <View style={[screenStyles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={screenStyles.container} contentContainerStyle={[screenStyles.content, { paddingBottom: 140 }]}>
        <View style={screenStyles.header}>
          <Text style={[screenStyles.title, { color: theme.text, marginBottom: 8 }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            <SegmentedControl<ThemeMode>
              value={settings.themeMode}
              options={[{ label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
              onChange={changeThemeMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            <SettingRow label="Push Notifications" value={settings.notificationsEnabled} onValueChange={(value) => void enableNotifications(value)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Theme Color</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            <View style={styles.colorRow}>
              {(Object.keys(accentColors) as AccentColor[]).map((colorKey) => (
                <Pressable
                  key={colorKey}
                  onPress={() => changeAccentColor(colorKey)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: accentColors[colorKey] },
                  ]}
                >
                  {settings.accentColor === colorKey && (
                    <AppIcon name="checkmark" size={24} color="#ffffff" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Advanced Colors</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            <Button label="Custom Theme Color" variant="secondary" onPress={() => { setPickerTarget('theme'); setPickerVisible(true); }} />
            <Button label="Custom Background Color" variant="secondary" onPress={() => { setPickerTarget('background'); setPickerVisible(true); }} />
            {settings.backgroundColorOverride && (
               <Button label="Reset Background" variant="danger" onPress={() => settings.setBackgroundColorOverride(undefined)} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Data Management</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Tasks</Text>
              <Text style={[styles.dataValue, { color: theme.secondaryText }]}>{dbInfo?.taskCount ?? 0}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Reminders</Text>
              <Text style={[styles.dataValue, { color: theme.secondaryText }]}>{dbInfo?.reminderCount ?? 0}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Notes</Text>
              <Text style={[styles.dataValue, { color: theme.secondaryText }]}>{dbInfo?.noteCount ?? 0}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>Database Version</Text>
              <Text style={[styles.dataValue, { color: theme.secondaryText }]}>v{dbInfo?.migrationVersion ?? 0}</Text>
            </View>
            <View style={styles.buttonGroup}>
              <Button label="Export Data" variant="secondary" onPress={() => showInfo('Export Data', 'Export wiring is reserved for the next iteration.')} />
              <Button label="Import Data" variant="secondary" onPress={() => showInfo('Import Data', 'Import wiring is reserved for the next iteration.')} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Cloud Sync (Beta)</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            {signedInEmail ? (
              <>
                <View style={styles.dataRow}>
                  <Text style={[styles.dataLabel, { color: theme.text }]}>Signed In</Text>
                  <Text numberOfLines={1} style={[styles.dataValue, styles.authEmailValue, { color: theme.secondaryText }]}>{signedInEmail}</Text>
                </View>
                <View style={styles.buttonGroup}>
                  <Button label="Push Local" loading={syncLoading === 'push'} disabled={!!syncLoading} onPress={() => void handlePushLocal()} />
                  <Button label="Pull Cloud" variant="secondary" loading={syncLoading === 'pull'} disabled={!!syncLoading} onPress={() => void handlePullCloud()} />
                  <Button label="Sign Out" variant="secondary" loading={authLoading} onPress={() => void handleSignOut()} />
                </View>
              </>
            ) : (
              <>
                <FormField
                  label="Email"
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                />
                <FormField
                  label="Password"
                  value={authPassword}
                  onChangeText={setAuthPassword}
                  secureTextEntry
                  placeholder="Minimum 6 characters"
                />
                <View style={styles.authButtonRow}>
                  <Button label="Sign In" loading={authLoading} onPress={() => void handleAuth('sign-in')} style={styles.authButton} />
                  <Button label="Sign Up" variant="secondary" loading={authLoading} onPress={() => void handleAuth('sign-up')} style={styles.authButton} />
                </View>
              </>
            )}
            <Text style={[styles.infoText, { color: theme.secondaryText }]}>Use Push Local to back up this device. After reinstalling, sign in and use Pull Cloud to restore saved data.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>About</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadow]}>
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.text }]}>App Version</Text>
              <Text style={[styles.dataValue, { color: theme.secondaryText }]}>1.0.0</Text>
            </View>
          </View>
        </View>

      </ScrollView>
      <ConfirmDialog config={dialog} onCancel={() => setDialog(null)} />
      
      <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPickerVisible(false)}>
        <View style={[screenStyles.container, { backgroundColor: theme.background, padding: 24 }]}>
          <Text style={[screenStyles.title, { color: theme.text, marginBottom: 24, marginTop: 40 }]}>Pick {pickerTarget === 'theme' ? 'Theme Color' : 'Background Color'}</Text>
          <ColorPicker 
            style={{ width: '100%', gap: 24 }} 
            value={pickerTarget === 'theme' ? (accentColors[settings.accentColor as keyof typeof accentColors] || settings.accentColor) : (settings.backgroundColorOverride || theme.background)} 
            onComplete={(colors) => setTempColor(colors.hex)}
          >
            <Preview />
            <Panel1 />
            <HueSlider />
          </ColorPicker>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 40 }}>
            <Button label="Cancel" variant="secondary" onPress={() => setPickerVisible(false)} style={{ flex: 1 }} />
            <Button label="Save" onPress={() => {
              if (pickerTarget === 'theme') {
                settings.setAccentColor(tempColor);
                showInfo('Settings Saved', 'Custom theme color applied.');
              } else {
                settings.setBackgroundColorOverride(tempColor);
                showInfo('Settings Saved', 'Custom background color applied.');
              }
              setPickerVisible(false);
            }} style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const theme = useThemeColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataLabel: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  dataValue: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
  authButton: {
    flex: 1,
  },
  authButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  authEmailValue: {
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
  },
  infoText: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
