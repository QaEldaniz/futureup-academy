import QRCode from 'qrcode';

/**
 * Generate a QR code as a base64 data URL
 * @param url - The URL to encode in the QR code
 * @returns base64 data URL string (data:image/png;base64,...)
 */
export async function generateQRCode(url: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1E40AF',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  return dataUrl;
}
