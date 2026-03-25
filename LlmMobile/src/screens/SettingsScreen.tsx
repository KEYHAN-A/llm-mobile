import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../components/common/SafeScreen';
import { useSettingsStore } from '../stores/settingsStore';
import { useModelStore } from '../stores/modelStore';
import * as modelManager from '../services/modelManager';
import { listAvailableModels, deleteModelFile, type ModelFileInfo } from '../services/downloadService';
import { useAppTheme } from '../theme/useAppTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function SettingsScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const settings = useSettingsStore();
  const modelStatus = useModelStore((s) => s.status);
  const selectedModel = useModelStore((s) => s.selectedModelFilename);
  const loadedModel = useModelStore((s) => s.loadedModelFilename);
  const [models, setModels] = useState<ModelFileInfo[]>([]);

  useEffect(() => {
    listAvailableModels().then(setModels);
  }, []);

  const handleUnload = useCallback(async () => {
    await modelManager.unloadModel();
  }, []);

  const handleSwitchModel = useCallback(async (model: ModelFileInfo) => {
    if (model.filename === loadedModel) return;
    if (modelStatus === 'ready') {
      await modelManager.unloadModel();
    }
    useModelStore.getState().setSelectedModel(model.filename);
  }, [modelStatus, loadedModel]);

  const handleDeleteModel = useCallback((model: ModelFileInfo) => {
    Alert.alert(
      'Delete model?',
      `${model.filename} (${model.sizeLabel}) will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (loadedModel === model.filename && modelStatus === 'ready') {
              await modelManager.unloadModel();
            }
            await deleteModelFile(model.filename);
            if (selectedModel === model.filename) {
              useModelStore.getState().setSelectedModel(null);
            }
            const updated = await listAvailableModels();
            setModels(updated);
            useModelStore.getState().setAvailableModels(updated);
          },
        },
      ],
    );
  }, [modelStatus, loadedModel, selectedModel]);

  const handleChangeModel = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  }, [navigation]);

  return (
    <SafeScreen>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[typography.body, { color: colors.primary }]}>
            {'\u2190'} Back
          </Text>
        </TouchableOpacity>
        <Text style={[typography.bodyBold, { color: colors.text }]}>
          Settings
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>
        {/* Inference Parameters */}
        <Text
          style={[
            typography.h3,
            { color: colors.text, marginBottom: spacing.md },
          ]}>
          Inference
        </Text>

        <SettingSlider
          label="Temperature"
          value={settings.temperature}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => settings.updateSettings({ temperature: v })}
          colors={colors}
        />
        <SettingSlider
          label="Top P"
          value={settings.topP}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => settings.updateSettings({ topP: v })}
          colors={colors}
        />
        <SettingSlider
          label="Top K"
          value={settings.topK}
          min={1}
          max={100}
          step={1}
          onChange={(v) => settings.updateSettings({ topK: v })}
          colors={colors}
        />
        <SettingSlider
          label="Max Tokens"
          value={settings.maxTokens}
          min={256}
          max={4096}
          step={256}
          onChange={(v) => settings.updateSettings({ maxTokens: v })}
          colors={colors}
        />
        <SettingSlider
          label="Context Messages"
          value={settings.maxContextMessages}
          min={2}
          max={50}
          step={2}
          onChange={(v) => settings.updateSettings({ maxContextMessages: v })}
          colors={colors}
        />

        {/* App Settings */}
        <Text
          style={[
            typography.h3,
            { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
          ]}>
          App
        </Text>

        <View style={styles.switchRow}>
          <Text style={[typography.body, { color: colors.text }]}>
            Haptic Feedback
          </Text>
          <Switch
            value={settings.hapticFeedback}
            onValueChange={(v) => settings.updateSettings({ hapticFeedback: v })}
            trackColor={{ true: colors.primary }}
          />
        </View>

        {/* Model Management */}
        <Text
          style={[
            typography.h3,
            { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
          ]}>
          Models
        </Text>

        {models.map((model) => {
          const isSelected = model.filename === selectedModel;
          const isLoaded = model.filename === loadedModel;
          return (
            <View
              key={model.filename}
              style={[
                styles.modelRow,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}>
              <TouchableOpacity
                style={styles.modelInfo}
                onPress={() => handleSwitchModel(model)}>
                <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
                  {model.filename.replace('.gguf', '')}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {model.sizeLabel}
                  {isLoaded ? ' \u2022 Loaded' : isSelected ? ' \u2022 Selected' : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteModel(model)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[typography.caption, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {models.length === 0 && (
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            No models found. Push .gguf files via ADB.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={handleChangeModel}>
          <Text style={[typography.body, { color: colors.primary }]}>
            Rescan / Change Model
          </Text>
        </TouchableOpacity>

        {modelStatus === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={handleUnload}>
            <Text style={[typography.body, { color: colors.warning }]}>
              Unload Model
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.surface, marginTop: spacing.xl },
          ]}
          onPress={() => settings.resetToDefaults()}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Reset to Defaults
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  colors,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  colors: any;
}) {
  const displayValue = step >= 1 ? value.toFixed(0) : value.toFixed(2);

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.labelRow}>
        <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {displayValue}
        </Text>
      </View>
      <Slider
        style={sliderStyles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onSlidingComplete={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.surfaceElevated}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  modelInfo: { flex: 1 },
  actionButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
});

const sliderStyles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  slider: { width: '100%', height: 40 },
});
