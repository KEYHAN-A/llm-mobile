import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../components/common/SafeScreen';
import { useAppTheme } from '../theme/useAppTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useModelStore } from '../stores/modelStore';
import { listAvailableModels, getModelDir, type ModelFileInfo } from '../services/downloadService';

export function OnboardingScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const [models, setModels] = useState<ModelFileInfo[]>([]);
  const [scanning, setScanning] = useState(true);
  const [modelDir, setModelDir] = useState('');

  useEffect(() => {
    scanModels();
  }, []);

  const scanModels = async () => {
    setScanning(true);
    setModelDir(getModelDir());
    const found = await listAvailableModels();
    setModels(found);
    const store = useModelStore.getState();
    store.setAvailableModels(found);

    if (found.length > 0) {
      // If there's a previously selected model that still exists, go straight to chat
      const selected = useModelStore.getState().selectedModelFilename;
      if (selected && found.some((m) => m.filename === selected)) {
        navigation.reset({ index: 0, routes: [{ name: 'Chat' }] });
        setScanning(false);
        return;
      }
      // If only one model, auto-select it and go to chat
      if (found.length === 1) {
        useModelStore.getState().setSelectedModel(found[0].filename);
        navigation.reset({ index: 0, routes: [{ name: 'Chat' }] });
        setScanning(false);
        return;
      }
    }
    setScanning(false);
  };

  const handleSelectModel = (model: ModelFileInfo) => {
    useModelStore.getState().setSelectedModel(model.filename);
    navigation.reset({ index: 0, routes: [{ name: 'Chat' }] });
  };

  if (scanning) {
    return (
      <SafeScreen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            Scanning for models...
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.text }]}>
            Local AI Chat
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            Run LLMs entirely on your device. No internet required.
          </Text>
        </View>

        {models.length > 0 ? (
          <>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
              Select a model
            </Text>
            <FlatList
              data={models}
              keyExtractor={(item) => item.filename}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSelectModel(item)}
                  activeOpacity={0.7}>
                  <Text style={[typography.bodyBold, { color: colors.text }]} numberOfLines={1}>
                    {item.filename.replace('.gguf', '')}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {item.sizeLabel}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.list}
            />
          </>
        ) : (
          <View style={styles.emptySection}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
              No models found
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Push .gguf model files to your device:
            </Text>
            <View style={[styles.codeBox, { backgroundColor: colors.surface }]}>
              <Text style={[typography.small, { color: colors.textSecondary, fontFamily: 'monospace' }]}>
                adb push model.gguf{'\n'}{modelDir}/
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.surfaceElevated }]}
          onPress={scanModels}>
          <Text style={[typography.bodyBold, { color: colors.primary }]}>
            Rescan Models
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: spacing.xxxl, marginBottom: spacing.xl },
  list: { paddingBottom: spacing.lg },
  modelCard: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptySection: { flex: 1, justifyContent: 'center' },
  codeBox: {
    padding: spacing.md,
    borderRadius: 8,
  },
  refreshButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
});
