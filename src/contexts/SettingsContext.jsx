import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from "react";
import {
  initialiseStorage,
  saveSettings,
  loadSettings,
} from "@/services/persistenceService";
import {
  formatDateTime,
  parseFormatString,
} from "@fraserelliott/date-formatter";
import { error as tauriError } from "@tauri-apps/plugin-log";

const SettingsContext = createContext(undefined);

const DEFAULT_SETTINGS = {
  dateTimeFormat: parseFormatString("DD-MMM-YYYY hh:mm"),
};

export function SettingsProvider({ children }) {
  const saveQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        await initialiseStorage();
        const savedSettings = await loadSettings();
        if (!cancelled) {
          setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load settings:", err);
          setSettings(DEFAULT_SETTINGS);
          setLoading(false);
          setError(err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || error) return;

    saveQueue.current = saveQueue.current
      .then(() => saveSettings(settings))
      .catch((err) => {
        // keep the chain alive
        tauriError("Failed to save projects:", err);
      });
  }, [settings, loading, error]);

  const formatTimestamp = (date) =>
    formatDateTime(date, settings.dateTimeFormat);

  const value = useMemo(
    () => ({
      loading,
      settings,
      formatTimestamp,
    }),
    [loading, settings, formatTimestamp],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
