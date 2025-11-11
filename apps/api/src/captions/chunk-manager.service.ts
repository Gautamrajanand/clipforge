import { Injectable, Logger } from '@nestjs/common';
import { Word } from './captions.service';

export interface Chunk {
  index: number;
  startTime: number;
  endTime: number;
  duration: number;
  words: Word[];
}

export interface ChunkBoundary {
  time: number;
  wordIndex: number;
}

@Injectable()
export class ChunkManagerService {
  private readonly logger = new Logger(ChunkManagerService.name);
  private readonly CHUNK_SIZE = 8; // 8 seconds per chunk (ultra-conservative for memory)
  private readonly OVERLAP = 0.5; // 0.5 second overlap for smooth transitions

  /**
   * Split a long clip into manageable chunks
   */
  splitIntoChunks(
    words: Word[],
    totalDuration: number,
    chunkSize: number = this.CHUNK_SIZE,
  ): Chunk[] {
    this.logger.log(`Splitting ${totalDuration}s clip into ${chunkSize}s chunks`);

    if (totalDuration <= chunkSize) {
      // No need to chunk, return single chunk
      return [
        {
          index: 0,
          startTime: 0,
          endTime: totalDuration,
          duration: totalDuration,
          words: words,
        },
      ];
    }

    const chunks: Chunk[] = [];
    const boundaries = this.calculateChunkBoundaries(words, totalDuration, chunkSize);

    for (let i = 0; i < boundaries.length - 1; i++) {
      const startBoundary = boundaries[i];
      const endBoundary = boundaries[i + 1];

      // Get words for this chunk
      const chunkWords = words.filter(
        (word) => word.start >= startBoundary.time && word.end <= endBoundary.time,
      );

      // Adjust word timings to be relative to chunk start
      const adjustedWords = chunkWords.map((word) => ({
        ...word,
        start: word.start - startBoundary.time,
        end: word.end - startBoundary.time,
      }));

      chunks.push({
        index: i,
        startTime: startBoundary.time,
        endTime: endBoundary.time,
        duration: endBoundary.time - startBoundary.time,
        words: adjustedWords,
      });

      this.logger.log(
        `Chunk ${i}: ${startBoundary.time.toFixed(2)}s - ${endBoundary.time.toFixed(2)}s (${adjustedWords.length} words)`,
      );
    }

    return chunks;
  }

  /**
   * Calculate optimal chunk boundaries based on word timings
   * Tries to split at natural pauses (sentence ends, long gaps)
   */
  private calculateChunkBoundaries(
    words: Word[],
    totalDuration: number,
    chunkSize: number,
  ): ChunkBoundary[] {
    const boundaries: ChunkBoundary[] = [{ time: 0, wordIndex: 0 }];

    let currentTime = 0;
    let currentWordIndex = 0;

    while (currentTime < totalDuration) {
      const targetTime = currentTime + chunkSize;

      if (targetTime >= totalDuration) {
        // Last chunk
        boundaries.push({ time: totalDuration, wordIndex: words.length });
        break;
      }

      // Find the best split point near targetTime
      const splitPoint = this.findOptimalSplitPoint(words, currentWordIndex, targetTime);

      boundaries.push(splitPoint);
      currentTime = splitPoint.time;
      currentWordIndex = splitPoint.wordIndex;
    }

    return boundaries;
  }

  /**
   * Find the optimal split point near the target time
   * Prefers sentence ends or long gaps between words
   */
  private findOptimalSplitPoint(
    words: Word[],
    startIndex: number,
    targetTime: number,
  ): ChunkBoundary {
    const SEARCH_WINDOW = 2; // Look 2 seconds before/after target
    const minTime = targetTime - SEARCH_WINDOW;
    const maxTime = targetTime + SEARCH_WINDOW;

    let bestSplitIndex = startIndex;
    let bestSplitTime = targetTime;
    let bestScore = -1;

    // Search for words in the window
    for (let i = startIndex; i < words.length; i++) {
      const word = words[i];

      if (word.end < minTime) continue;
      if (word.start > maxTime) break;

      // Calculate score for this split point
      let score = 0;

      // Prefer sentence ends
      if (word.text.match(/[.!?]$/)) {
        score += 10;
      }

      // Prefer long gaps after this word
      if (i < words.length - 1) {
        const gap = words[i + 1].start - word.end;
        score += Math.min(gap * 2, 5); // Up to 5 points for gaps
      }

      // Prefer splits closer to target time
      const timeDiff = Math.abs(word.end - targetTime);
      score -= timeDiff * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestSplitIndex = i + 1;
        bestSplitTime = word.end;
      }
    }

    return {
      time: bestSplitTime,
      wordIndex: bestSplitIndex,
    };
  }

  /**
   * Validate chunk alignment and detect issues
   */
  validateChunks(chunks: Chunk[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for gaps between chunks
    for (let i = 0; i < chunks.length - 1; i++) {
      const currentChunk = chunks[i];
      const nextChunk = chunks[i + 1];

      const gap = nextChunk.startTime - currentChunk.endTime;

      if (gap > 0.1) {
        errors.push(
          `Gap detected between chunk ${i} and ${i + 1}: ${gap.toFixed(2)}s`,
        );
      }

      if (gap < -0.1) {
        errors.push(
          `Overlap detected between chunk ${i} and ${i + 1}: ${Math.abs(gap).toFixed(2)}s`,
        );
      }
    }

    // Check for empty chunks
    for (const chunk of chunks) {
      if (chunk.words.length === 0) {
        errors.push(`Chunk ${chunk.index} has no words`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get chunk metadata for progress tracking
   */
  getChunkMetadata(chunks: Chunk[]): {
    totalChunks: number;
    totalDuration: number;
    averageChunkSize: number;
    totalWords: number;
  } {
    const totalDuration = chunks.reduce((sum, chunk) => sum + chunk.duration, 0);
    const totalWords = chunks.reduce((sum, chunk) => sum + chunk.words.length, 0);

    return {
      totalChunks: chunks.length,
      totalDuration,
      averageChunkSize: totalDuration / chunks.length,
      totalWords,
    };
  }
}
