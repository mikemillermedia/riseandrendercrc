
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the Community Assistant for 'Rise and Render', a community for Creatives Representing Christ.
      You help Creatives Representing Christ (videographers, podcasters, designers, writers, and makers) navigate the technical side of their journey so they can use their gifts to represent Christ with excellence.
      
      Core Focus & Pillars:
      1. Geek Out & Troubleshoot: Help with tech, gear recommendations, software setups, and production workflows.
      2. Connect: Meet like-minded creatives sharing faith and passion for high-quality production.
      3. Share: Showcase projects, get feedback, celebrate wins.
      4. Pray: Lift each other up through prayer and spiritual support.
      5. Inspire: Encourage one another to grow creatively and spiritually.
      
      Key Information to share when relevant:
      - Mike Miller: The creator and founder of Rise & Render and Mike Miller Media (https://mikemillermedia.com). He helps enhance digital presence and drive results with engaging content and tailored strategies.
      - Rise & Render DFW: We are the DFW creative partner for experts & coaches, providing end-to-end video podcasting and content services. We turn your raw expertise into a polished, powerful brand for high-level distribution & tangible conversions.
      - DFW Studio: We have a fully equipped podcast studio available for local members in Dallas-Fort Worth.
      - Resources: We provide free technical and creative resources to help members build their platforms. Premium services coming later.
      - Building Phase: We are currently in the building phase. Encourage users to fill out the form to join the waitlist and shape the community.
      
      Tone: Professional, highly practical, tech-focused, encouraging, and faith-based. You are here to help them master the tools of the trade.`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI is currently offline.";
  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Transmission interrupted.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "There was a signal error. Please try asking again.";
  }
};

export const critiqueSetup = async (imageData: string, answers: any): Promise<string> => {
  if (!process.env.API_KEY) return "Critique engine offline.";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this user's production setup image and their responses:
    - Frustration: ${answers.frustration}
    - Setup Time: ${answers.time}
    - Hated Gear: ${answers.hate}
    
    Task: Provide a "Rise & Render" style critique.
    1. Identify visible issues in the photo (lighting glare, messy cables, poor camera angle, etc).
    2. Explain why their current "budget" choices are causing the ${answers.frustration} they mentioned.
    3. Use a tone that is authoritative but helpful. 
    4. Mention how the Rise & Render optimized system (Sony ZV-E10, native lenses, Shure audio) specifically solves their exact friction point.
    5. Keep it to 3-4 punchy paragraphs. End with a strong call to action to move toward optimization.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          parts: [
            { inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      ]
    });
    return response.text || "Critique failed to render.";
  } catch (error) {
    console.error("Critique Error:", error);
    return "The critique engine encountered an error analyzing your space. Ensure your image is clear and try again.";
  }
};

export const generateWorkflowDiagram = async (prompt: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Gen Error:", error);
  }
  return null;
};

// TTS Helper Functions
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generatePackageVoiceover = async (packageName: string, details: string): Promise<void> => {
  if (!process.env.API_KEY) return;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Say persuasively, professionally, and with a modern tech founder vibe: "Here is what the ${packageName} offers you. ${details}. This is about moving from overwhelmed to optimized."`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContext,
        24000,
        1,
      );
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
