import { Modal, View } from 'react-native';
import { AuthWebView } from './AuthWebView';
import { useAuthModal, useAuthStore } from './store';

export const AuthModal = () => {
  const { isOpen, mode } = useAuthModal();
  const { auth } = useAuthStore();

  const proxyURL = process.env.EXPO_PUBLIC_PROXY_BASE_URL;
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

  if (!proxyURL && !baseURL) {
    return null;
  }

  return (
    <Modal
      visible={isOpen && !auth}
      transparent={true}
      animationType="slide"
    >
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          width: '100%',
          backgroundColor: '#fff',
          padding: 0,
        }}
      >
        <AuthWebView
          mode={mode}
          proxyURL={proxyURL}
          baseURL={baseURL}
        />
      </View>
    </Modal>
  );
};

export default AuthModal;