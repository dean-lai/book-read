/**
 * Text-to-speech (e.g. ElevenLabs) for listening mode.
 */

export type TtsInput = {
  text: string;
  voiceId?: string;
};

export async function synthesizeSpeech(
  _input: TtsInput,
): Promise<{ audioUrl: string }> {
  throw new Error("tts-service: synthesizeSpeech not implemented");
}
