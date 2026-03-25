# LLM Mobile

Run large language models **entirely on your phone**. No cloud, no internet, no data leaving your device.

LLM Mobile is an open-source React Native app that runs GGUF-quantized language models locally on Android (iOS support planned) using [llama.rn](https://github.com/mybigday/llama.rn) — a mobile-optimized binding for [llama.cpp](https://github.com/ggerganov/llama.cpp).

## Features

- **Fully offline** — inference runs on-device with zero network calls
- **Multi-model support** — push any GGUF model to the device and pick from a list
- **Streaming responses** — tokens stream in real-time with RAF batching for smooth UI
- **Conversation management** — multiple conversations with auto-titling and persistence
- **Configurable inference** — temperature, top-p, top-k, max tokens, context window
- **Memory safety** — real-time RAM monitoring with warnings and emergency unload
- **Markdown rendering** — assistant responses rendered with full markdown support
- **Dark/light theme** — follows system preference or manual override
- **Haptic feedback** — optional tactile response on interactions

## Architecture

```
src/
├── components/       # Reusable UI (MessageBubble, InputBar, ModelStatusBar, etc.)
├── hooks/            # React hooks (useInference, useModelLifecycle, useMemoryMonitor)
├── navigation/       # React Navigation stack (Onboarding → Chat → Settings)
├── screens/          # OnboardingScreen, ChatScreen, ConversationListScreen, SettingsScreen
├── services/         # Core logic (modelManager, inferenceService, memoryService)
├── stores/           # Zustand state (chatStore, modelStore, settingsStore)
├── theme/            # Colors, typography, spacing, useAppTheme hook
├── types/            # TypeScript interfaces (chat, model, navigation)
└── utils/            # Constants, MMKV storage, conversation builder
```

**Key tech:**
- **llama.rn** — native llama.cpp bindings with JSI streaming callbacks
- **Zustand + MMKV** — fast persisted state management
- **FlashList** — efficient message rendering
- **react-native-reanimated** — smooth animations (typing indicator)
- **React Navigation** — native stack navigation

## Quick Start

### Prerequisites

- Node.js >= 22
- Android SDK (API 36, NDK 27.1)
- A physical Android device with USB debugging enabled
- A GGUF model file (Q4_K_M quantization recommended)

### 1. Clone and install

```bash
git clone https://github.com/KEYHAN-A/llm-mobile.git
cd llm-mobile/LlmMobile
npm install
```

### 2. Build and install

```bash
# Set your Android SDK path
echo "sdk.dir=/path/to/android/sdk" > android/local.properties

# Build debug APK (bundles JS — no Metro needed on device)
cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a

# Install on connected device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Push model(s) to the device

Launch the app once to create the models directory, then push your GGUF files:

```bash
adb push your-model.gguf /sdcard/Android/data/com.llmmobile/files/models/
```

You can push multiple models — the app will show a picker.

### 4. Run

Open the app, select a model, tap **"Tap to load"**, and start chatting.

## Recommended Models

Any GGUF model compatible with llama.cpp works. Recommended quantizations for mobile:

| Model | Size | RAM Needed | Notes |
|-------|------|-----------|-------|
| Mistral 7B Instruct v0.2 (Q4_K_M) | ~4.4 GB | ~6 GB | Good balance of quality and speed |
| Llama 3.1 8B Instruct (Q4_K_M) | ~4.9 GB | ~7 GB | Strong general-purpose |
| Phi-3 Mini 3.8B (Q4_K_M) | ~2.3 GB | ~4 GB | Fast, great for low-RAM devices |
| Gemma 2 2B (Q4_K_M) | ~1.6 GB | ~3 GB | Smallest practical option |

Find models on [HuggingFace](https://huggingface.co/models?search=gguf).

## Configuration

All inference parameters are adjustable in the Settings screen:

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Temperature | 0.7 | 0-2 | Randomness of output |
| Top P | 0.9 | 0-1 | Nucleus sampling threshold |
| Top K | 40 | 1-100 | Top-k sampling |
| Max Tokens | 2048 | 256-4096 | Maximum response length |
| Context Messages | 20 | 2-50 | Messages included in context |

## How It Works

1. **Model Loading** — `llama.rn` calls `initLlama()` which loads the GGUF file via `mmap`. The model weights stay on disk and are paged into RAM on demand by the OS.

2. **Inference** — `context.completion()` runs token generation on a background thread with a JSI callback that fires for each token. Tokens are batched via `requestAnimationFrame` for efficient UI updates.

3. **Memory Management** — The app monitors device RAM during inference. At 80% usage it warns; at 90% it emergency-stops generation. On iOS, system memory warnings trigger automatic model unload.

4. **Context Building** — Messages are formatted using the model's chat template via `context.getFormattedChat()`. A token budget system progressively trims old messages to fit within the context window.

## Development

```bash
# Start Metro bundler (for dev with hot reload)
# First, re-enable Metro in build.gradle by commenting out debuggableVariants = []
npx react-native start

# Run on connected device
npx react-native run-android

# Run tests
npm test

# Lint
npm run lint
```

## Project Structure Details

### State Management

- **chatStore** — Conversations, messages, streaming state. Persisted via MMKV.
- **modelStore** — Model loading status, available models, selected model. Selected model persisted.
- **settingsStore** — Inference parameters, theme, haptics. Fully persisted.

### Services

- **modelManager** — Loads/unloads models via llama.rn. Handles memory pre-checks.
- **inferenceService** — Runs streaming completion with token batching.
- **memoryService** — Device RAM checks via react-native-device-info.
- **downloadService** — Model file scanning, path resolution, directory management.

## License

MIT

## Contributing

Contributions welcome. Please open an issue first to discuss what you'd like to change.
