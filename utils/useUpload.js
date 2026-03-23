import * as React from 'react';

function useUpload() {
  const [loading, setLoading] = React.useState(false);

  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);
      let response;

      if ("reactNativeAsset" in input && input.reactNativeAsset) {
        let asset = input.reactNativeAsset;
        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          name: asset.name || 'upload',
          type: asset.mimeType || 'application/octet-stream',
        });
        response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
      } else if ("url" in input) {
        response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input.url })
        });
      } else if ("base64" in input) {
        response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: input.base64 })
        });
      }

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Upload failed: File too large.");
        }
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return { url: data.url, mimeType: data.mimeType || null };
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;