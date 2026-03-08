/**
 * OCR Accuracy Test using Tesseract.js (Node.js)
 * Tests the synthetic prescriptions using the same OCR service as your backend
 */

import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRESCRIPTIONS_DIR = path.join(__dirname, 'synthetic_prescriptions');
const LABELS_DIR = path.join(PRESCRIPTIONS_DIR, 'labels');
const RESULTS_DIR = path.join(PRESCRIPTIONS_DIR, 'ocr_results');
const METADATA_FILE = path.join(PRESCRIPTIONS_DIR, 'metadata.json');

class OCRTesterNode {
  async loadMetadata() {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  }

  calculateAccuracy(groundTruth, ocrResult) {
    if (!ocrResult) {
      return { characterAccuracy: 0, wordAccuracy: 0, similarityRatio: 0 };
    }

    // Normalize text
    const gtNormalized = groundTruth.toLowerCase().replace(/\s+/g, ' ').trim();
    const ocrNormalized = ocrResult.toLowerCase().replace(/\s+/g, ' ').trim();

    // Character-level similarity (simple approach)
    let matches = 0;
    const maxLen = Math.max(gtNormalized.length, ocrNormalized.length);
    const minLen = Math.min(gtNormalized.length, ocrNormalized.length);
    
    for (let i = 0; i < minLen; i++) {
      if (gtNormalized[i] === ocrNormalized[i]) {
        matches++;
      }
    }
    const similarityRatio = matches / maxLen;

    // Word-level accuracy
    const gtWords = new Set(groundTruth.toLowerCase().split(/\s+/));
    const ocrWords = new Set(ocrResult.toLowerCase().split(/\s+/));
    
    let wordMatches = 0;
    gtWords.forEach(word => {
      if (ocrWords.has(word)) wordMatches++;
    });
    
    const wordAccuracy = gtWords.size > 0 ? (wordMatches / gtWords.size) * 100 : 0;

    return {
      characterAccuracy: similarityRatio * 100,
      wordAccuracy,
      similarityRatio
    };
  }

  async testPrescription(imagePath, groundTruth) {
    console.log(`  Processing: ${path.basename(imagePath)}...`);
    
    try {
      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: () => {}, // Suppress verbose logging
      });

      const ocrText = result.data.text;
      const confidence = result.data.confidence;
      const accuracy = this.calculateAccuracy(groundTruth, ocrText);

      return {
        ocrText,
        confidence,
        accuracy
      };
    } catch (error) {
      console.error(`    ❌ Error: ${error}`);
      return null;
    }
  }

  async runTests() {
    console.log('\n' + '='.repeat(70));
    console.log('  OCR Accuracy Testing with Tesseract.js (Node.js)');
    console.log('='.repeat(70));
    console.log();

    // Create results directory
    await fs.mkdir(RESULTS_DIR, { recursive: true });

    // Load metadata
    const metadata = await this.loadMetadata();
    console.log(`Testing ${metadata.length} prescriptions...`);
    console.log();

    const results = [];
    const qualityStats = { high: [], medium: [], low: [] };
    
    let totalCharAcc = 0;
    let totalWordAcc = 0;
    let totalConfidence = 0;
    let tested = 0;

    // Test first 10 prescriptions (for speed)
    const testCount = Math.min(10, metadata.length);
    console.log(`Note: Testing first ${testCount} prescriptions for speed.`);
    console.log('For full test, modify testCount variable in script.\n');

    for (let i = 0; i < testCount; i++) {
      const item = metadata[i];
      const imagePath = path.join(PRESCRIPTIONS_DIR, item.filename);
      const labelPath = path.join(LABELS_DIR, item.label_file);

      // Read ground truth
      const groundTruth = await fs.readFile(labelPath, 'utf-8');

      // Run OCR
      const testResult = await this.testPrescription(imagePath, groundTruth);
      
      if (testResult) {
        results.push({
          id: item.id,
          filename: item.filename,
          quality: item.quality,
          confidence: testResult.confidence,
          accuracy: testResult.accuracy
        });

        qualityStats[item.quality].push(testResult.accuracy.characterAccuracy);
        
        totalCharAcc += testResult.accuracy.characterAccuracy;
        totalWordAcc += testResult.accuracy.wordAccuracy;
        totalConfidence += testResult.confidence;
        tested++;

        console.log(`    ✓ Confidence: ${testResult.confidence.toFixed(1)}% | Char Acc: ${testResult.accuracy.characterAccuracy.toFixed(1)}%`);
      }
    }

    if (tested > 0) {
      console.log();
      console.log('='.repeat(70));
      console.log('  Test Results Summary');
      console.log('='.repeat(70));
      console.log();
      console.log(`Total Prescriptions Tested: ${tested}`);
      console.log();
      console.log('Overall Metrics:');
      console.log(`  Character-level Accuracy: ${(totalCharAcc / tested).toFixed(2)}%`);
      console.log(`  Word-level Accuracy:      ${(totalWordAcc / tested).toFixed(2)}%`);
      console.log(`  OCR Confidence:           ${(totalConfidence / tested).toFixed(2)}%`);
      console.log();

      // Accuracy by quality
      console.log('Accuracy by Image Quality:');
      for (const [quality, accuracies] of Object.entries(qualityStats)) {
        if (accuracies.length > 0) {
          const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
          console.log(`  ${quality.charAt(0).toUpperCase() + quality.slice(1).padEnd(6)}: ${avg.toFixed(2)}% (n=${accuracies.length})`);
        }
      }
      console.log();

      // Save results
      const resultsFile = path.join(RESULTS_DIR, 'accuracy_results.json');
      await fs.writeFile(resultsFile, JSON.stringify({
        summary: {
          total_tested: tested,
          avg_character_accuracy: totalCharAcc / tested,
          avg_word_accuracy: totalWordAcc / tested,
          avg_confidence: totalConfidence / tested,
          by_quality: Object.fromEntries(
            Object.entries(qualityStats).map(([q, accs]) => [
              q,
              accs.length > 0 ? accs.reduce((a, b) => a + b, 0) / accs.length : 0
            ])
          )
        },
        detailed_results: results
      }, null, 2));

      console.log(`📊 Detailed results saved to: ${resultsFile}`);
      console.log();

      // Performance assessment
      const avgCharAcc = totalCharAcc / tested;
      console.log('Performance Assessment:');
      if (avgCharAcc >= 85) {
        console.log('  ✅ EXCELLENT - Ready for production use');
      } else if (avgCharAcc >= 70) {
        console.log('  ✓  GOOD - Acceptable with manual verification');
      } else if (avgCharAcc >= 50) {
        console.log('  ⚠️  FAIR - Needs improvement or better image preprocessing');
      } else {
        console.log('  ❌ POOR - Consider image preprocessing or better quality');
      }
      console.log();
      
      console.log('='.repeat(70));
      console.log('  Recommendations');
      console.log('='.repeat(70));
      console.log();
      console.log('To improve OCR accuracy:');
      console.log('  1. Add image preprocessing (grayscale, contrast, sharpen)');
      console.log('  2. Implement medicine name autocorrection');
      console.log('  3. Build pharmacist verification UI');
      console.log('  4. Use confidence-based routing');
      console.log();
      console.log('See: scripts/QUICK_REFERENCE.md for implementation details');
      console.log();
    } else {
      console.log('❌ No results to display');
    }
  }
}

// Run tests
const tester = new OCRTesterNode();
tester.runTests().catch(console.error);
