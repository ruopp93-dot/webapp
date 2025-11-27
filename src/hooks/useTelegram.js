import { useEffect, useMemo, useState, useCallback } from "react";

export function useTelegram() {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
    } else {
      setUser({
        id: "guest",
        first_name: "Гость",
        last_name: "",
        username: "guest"
      });
    }
  }, []);

  const sendEvent = useCallback(
    (type, payload) => {
      if (!webApp?.sendData) return;
      try {
        webApp.sendData(JSON.stringify({ type, payload }));
      } catch (err) {
        console.warn("sendData failed", err);
      }
    },
    [webApp]
  );

  const colorScheme = useMemo(() => webApp?.colorScheme || "dark", [webApp]);

  return { webApp, user, colorScheme, sendEvent };
}
