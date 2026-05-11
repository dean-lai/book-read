/**
 * Text-to-speech (e.g. ElevenLabs) for listening mode.
 */

export type TtsInput = {
  text: string;
  voiceId?: string;
};

export async function synthesizeSpeech(
  input: TtsInput,
): Promise<{ audioUrl: string }> {
  void input;
  throw new Error("tts-service: synthesizeSpeech not implemented");
}
