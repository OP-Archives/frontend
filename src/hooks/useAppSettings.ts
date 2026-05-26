import { useChatSettings, type UseChatSettingsReturn } from './useChatSettings';
import type { PlayerSettings } from '@/types';
import { loadPlayerSettings, savePlayerSettings } from '@/utils/playerSettings';

export { useChatSettings };

export interface UseAppSettingsReturn {
  chat: UseChatSettingsReturn;
  player: PlayerSettings;
  setPlayer: (settings: PlayerSettings) => void;
  loadPlayerSettings: () => PlayerSettings;
}

export function useAppSettings(): UseAppSettingsReturn {
  const chat = useChatSettings();

  const loadPlayerSettingsFn = (): PlayerSettings => loadPlayerSettings();

  const setPlayer = (settings: PlayerSettings): void => {
    savePlayerSettings(settings);
  };

  return {
    chat,
    player: loadPlayerSettingsFn(),
    setPlayer,
    loadPlayerSettings: loadPlayerSettingsFn,
  };
}
