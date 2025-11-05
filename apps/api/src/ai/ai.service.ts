import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI only if API key is provided
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate professional title and description for a video clip
   * Uses GPT-4 for high-quality, engagement-optimized results
   */
  async generateClipMetadata(
    transcript: string,
    context?: {
      videoTitle?: string;
      duration?: number;
      score?: number;
    },
  ): Promise<{ title: string; description: string }> {
    // If OpenAI not configured, fall back to transcript extraction
    if (!this.openai) {
      return this.fallbackGeneration(transcript);
    }

    try {
      const prompt = this.buildPrompt(transcript, context);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective, high quality
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating viral, engaging titles and descriptions for short-form video clips. 
Your titles should be:
- Catchy and attention-grabbing
- Clear and descriptive
- 40-60 characters long
- Optimized for social media (YouTube Shorts, Instagram Reels, TikTok)
- Professional and polished

Your descriptions should be:
- Compelling and informative
- 120-180 characters long
- Highlight the key value or insight
- Use engaging language
- End with a hook or call-to-action when appropriate`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return this.fallbackGeneration(transcript);
      }

      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generating clip metadata with OpenAI:', error);
      return this.fallbackGeneration(transcript);
    }
  }

  /**
   * Build the prompt for OpenAI
   */
  private buildPrompt(
    transcript: string,
    context?: {
      videoTitle?: string;
      duration?: number;
      score?: number;
    },
  ): string {
    let prompt = `Generate a viral title and engaging description for this video clip.\n\n`;

    if (context?.videoTitle) {
      prompt += `Video: "${context.videoTitle}"\n`;
    }

    if (context?.duration) {
      prompt += `Duration: ${context.duration} seconds\n`;
    }

    if (context?.score) {
      prompt += `AI Score: ${context.score}/100 (high engagement potential)\n`;
    }

    prompt += `\nTranscript:\n"${transcript.trim()}"\n\n`;
    prompt += `Respond in this exact format:\n`;
    prompt += `TITLE: [your title here]\n`;
    prompt += `DESCRIPTION: [your description here]`;

    return prompt;
  }

  /**
   * Parse OpenAI response
   */
  private parseResponse(response: string): {
    title: string;
    description: string;
  } {
    const titleMatch = response.match(/TITLE:\s*(.+?)(?:\n|$)/i);
    const descMatch = response.match(/DESCRIPTION:\s*(.+?)(?:\n|$)/is);

    let title = titleMatch?.[1]?.trim() || 'Engaging Video Moment';
    let description =
      descMatch?.[1]?.trim() ||
      'A compelling segment that captures key insights and engaging content.';

    // Clean up any quotes
    title = title.replace(/^["']|["']$/g, '');
    description = description.replace(/^["']|["']$/g, '');

    // Enforce length limits
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    return { title, description };
  }

  /**
   * Fallback to transcript extraction when OpenAI is unavailable
   */
  private fallbackGeneration(transcript: string): {
    title: string;
    description: string;
  } {
    if (!transcript || transcript.trim().length === 0) {
      return {
        title: 'Engaging Video Moment',
        description:
          'A compelling segment from the video that captures key insights and interesting content.',
      };
    }

    // Clean up transcript
    const cleaned = transcript
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b(um|uh|like|you know)\b/gi, '');

    // Split into sentences
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];

    // Generate title from first sentence
    let title = sentences[0]?.trim() || 'Key Video Moment';
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    title = title.replace(/[.!?]+$/, '');

    // Generate description from first 2-3 sentences
    let description = sentences.slice(0, 3).join(' ').trim();
    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    return { title, description };
  }

  /**
   * Check if OpenAI is available
   */
  isAvailable(): boolean {
    return this.openai !== null;
  }
}
