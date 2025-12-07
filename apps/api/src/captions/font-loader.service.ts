import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { registerFont } from 'canvas';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Font Loader Service
 * Registers custom fonts with node-canvas for caption rendering
 */
@Injectable()
export class FontLoaderService implements OnModuleInit {
  private readonly logger = new Logger(FontLoaderService.name);
  private fontsLoaded = false;

  onModuleInit() {
    this.loadFonts();
  }

  /**
   * Load and register all required fonts
   */
  loadFonts(): void {
    if (this.fontsLoaded) {
      this.logger.log('Fonts already loaded');
      return;
    }

    const fontsDir = path.join(__dirname, '..', '..', 'assets', 'fonts');
    
    // Check if fonts directory exists
    if (!fs.existsSync(fontsDir)) {
      this.logger.error(`Fonts directory not found: ${fontsDir}`);
      return;
    }

    const fonts = [
      { file: 'Impact.ttf', family: 'Impact' },
      { file: 'Arial.ttf', family: 'Arial' },
      { file: 'Arial Bold.ttf', family: 'Arial', weight: 'bold' },
      { file: 'Arial Black.ttf', family: 'Arial Black' },
      { file: 'Inter.ttf', family: 'Inter' },
      { file: 'Montserrat.ttf', family: 'Montserrat' },
    ];

    let loadedCount = 0;
    let failedCount = 0;

    for (const font of fonts) {
      const fontPath = path.join(fontsDir, font.file);
      
      if (!fs.existsSync(fontPath)) {
        this.logger.warn(`Font file not found: ${fontPath}`);
        failedCount++;
        continue;
      }

      try {
        registerFont(fontPath, {
          family: font.family,
          weight: font.weight || 'normal',
        });
        loadedCount++;
        this.logger.log(`✅ Loaded font: ${font.family} (${font.file})`);
      } catch (error) {
        this.logger.error(`❌ Failed to load font ${font.file}:`, error.message);
        failedCount++;
      }
    }

    this.fontsLoaded = true;
    this.logger.log(`Font loading complete: ${loadedCount} loaded, ${failedCount} failed`);
  }

  /**
   * Check if fonts are loaded
   */
  areFontsLoaded(): boolean {
    return this.fontsLoaded;
  }

  /**
   * Get list of available fonts
   */
  getAvailableFonts(): string[] {
    return [
      'Impact',
      'Arial',
      'Arial Black',
      'Inter',
      'Montserrat',
    ];
  }
}
