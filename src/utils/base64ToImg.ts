function base64ToImage(base64Data: string, filename: string): File {
  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error(
      "Invalid Base64 data: expected format 'data:[mime];base64,[data]'"
    );
  }
  const [_, mimeString, base64String] = match;
  const byteString = atob(base64String);
  const ia = Uint8Array.from(byteString, (char) => char.charCodeAt(0));
  return new File([ia.buffer], filename, { type: mimeString });
}

export default base64ToImage;
