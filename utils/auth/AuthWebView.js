import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from './store';

const callbackUrl = '/api/auth/token';
const callbackQueryString = `callbackUrl=${callbackUrl}`;

export const AuthWebView = ({ mode, proxyURL, baseURL }) => {
  const [currentURI, setURI] = useState(`${baseURL}/account/${mode}?${callbackQueryString}`);
  const { auth, setAuth, isReady } = useAuthStore();
  const isAuthenticated = isReady ? !!auth : null;
  const iframeRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isAuthenticated) {
      router.back();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    setURI(`${baseURL}/account/${mode}?${callbackQueryString}`);
  }, [mode, baseURL, isAuthenticated]);

  if (Platform.OS === 'web') {
    return (
      <iframe
        ref={iframeRef}
        title="Authentication"
        src={`${proxyURL}/account/${mode}?callbackUrl=/api/auth/expo-web-success`}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    );
  }

  return (
    <WebView
      sharedCookiesEnabled
      source={{ uri: currentURI }}
      onShouldStartLoadWithRequest={(request) => {
        if (request.url === `${baseURL}${callbackUrl}`) {
          fetch(request.url).then(async (response) => {
            response.json().then((data) => {
              setAuth({ jwt: data.jwt, user: data.user });
            });
          });
          return false;
        }
        if (request.url === currentURI) return true;
        const hasParams = request.url.includes('?');
        const separator = hasParams ? '&' : '?';
        const newURL = request.url.replaceAll(proxyURL, baseURL);
        if (newURL.endsWith(callbackUrl)) {
          setURI(newURL);
          return false;
        }
        setURI(`${newURL}${separator}${callbackQueryString}`);
        return false;
      }}
      style={{ flex: 1 }}
    />
  );
};