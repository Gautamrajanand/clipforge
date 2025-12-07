/**
 * Animation Adapter
 * Bridges old caption system with new advanced animation system
 */

import { Word } from './captions.service';
import { WordTiming } from './animation-types';

/**
 * Convert old Word format to new WordTiming format
 */
export function convertToWordTiming(words: Word[]): WordTiming[] {
  return words.map(word => ({
    text: word.text,
    start: word.start,
    end: word.end,
    isKeyword: false, // Will be detected by keyword detection logic
  }));
}

/**
 * Detect keywords in words for emphasis styles (Hormozi)
 * Keywords are typically: numbers, money terms, action verbs, superlatives
 */
export function detectKeywords(words: WordTiming[]): WordTiming[] {
  const keywordPatterns = [
    /^\$?\d+[kmb]?$/i, // Numbers, money ($100, 5k, 10m, 2b)
    /^(free|guaranteed|proven|secret|exclusive|limited|bonus|instant)$/i, // Power words
    /^(make|earn|save|get|build|grow|scale|double|triple)$/i, // Action verbs
    /^(best|worst|top|ultimate|perfect|amazing|incredible)$/i, // Superlatives
  ];

  return words.map(word => ({
    ...word,
    isKeyword: keywordPatterns.some(pattern => pattern.test(word.text)),
  }));
}

/**
 * Map old style IDs to new style IDs (if different)
 */
export function mapStyleId(oldStyleId: string): string {
  const styleMap: Record<string, string> = {
    // Most styles have the same ID
    // Add mappings here if any old IDs differ from new ones
  };

  return styleMap[oldStyleId] || oldStyleId;
}
