"""
OCR Accuracy Testing Script
Tests Tesseract OCR on synthetic prescriptions and calculates accuracy metrics
"""

import os
import json
import subprocess
import difflib
from pathlib import Path


# Paths
PRESCRIPTIONS_DIR = "synthetic_prescriptions"
LABELS_DIR = "synthetic_prescriptions/labels"
RESULTS_DIR = "synthetic_prescriptions/ocr_results"
METADATA_FILE = "synthetic_prescriptions/metadata.json"


class OCRTester:
    def __init__(self):
        self.prescriptions_dir = PRESCRIPTIONS_DIR
        self.labels_dir = LABELS_DIR
        self.results_dir = RESULTS_DIR
        
        # Create results directory
        os.makedirs(self.results_dir, exist_ok=True)
        
        # Load metadata
        self.metadata = self._load_metadata()
    
    def _load_metadata(self):
        """Load prescription metadata"""
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def run_tesseract_ocr(self, image_path):
        """
        Run Tesseract OCR on an image
        Requires tesseract to be installed: https://github.com/tesseract-ocr/tesseract
        """
        try:
            # Output file (tesseract adds .txt automatically)
            output_base = os.path.join(self.results_dir, 'temp_ocr')
            
            # Run tesseract command
            cmd = ['tesseract', image_path, output_base, '-l', 'eng']
            subprocess.run(cmd, check=True, capture_output=True)
            
            # Read output
            output_file = output_base + '.txt'
            with open(output_file, 'r', encoding='utf-8') as f:
                ocr_text = f.read()
            
            # Clean up temp file
            os.remove(output_file)
            
            return ocr_text
        except subprocess.CalledProcessError as e:
            print(f"❌ Tesseract error: {e}")
            return None
        except FileNotFoundError:
            print("❌ Tesseract not found. Install from: https://github.com/tesseract-ocr/tesseract")
            print("   Windows: Download installer from GitHub releases")
            print("   Ubuntu: sudo apt-get install tesseract-ocr")
            print("   Mac: brew install tesseract")
            return None
    
    def calculate_accuracy(self, ground_truth, ocr_result):
        """
        Calculate various accuracy metrics
        """
        if not ocr_result:
            return {
                'character_accuracy': 0.0,
                'word_accuracy': 0.0,
                'line_accuracy': 0.0,
                'similarity_ratio': 0.0
            }
        
        # Normalize text (lowercase, strip extra whitespace)
        gt_normalized = ' '.join(ground_truth.lower().split())
        ocr_normalized = ' '.join(ocr_result.lower().split())
        
        # Character-level accuracy using sequence matcher
        similarity = difflib.SequenceMatcher(None, gt_normalized, ocr_normalized)
        similarity_ratio = similarity.ratio()
        
        # Word-level accuracy
        gt_words = set(ground_truth.lower().split())
        ocr_words = set(ocr_result.lower().split())
        
        if len(gt_words) > 0:
            word_matches = len(gt_words.intersection(ocr_words))
            word_accuracy = word_matches / len(gt_words)
        else:
            word_accuracy = 0.0
        
        # Line-level accuracy
        gt_lines = [line.strip() for line in ground_truth.split('\n') if line.strip()]
        ocr_lines = [line.strip() for line in ocr_result.split('\n') if line.strip()]
        
        if len(gt_lines) > 0:
            line_matches = sum(1 for gt_line in gt_lines 
                             if any(difflib.SequenceMatcher(None, gt_line.lower(), 
                                   ocr_line.lower()).ratio() > 0.8 
                             for ocr_line in ocr_lines))
            line_accuracy = line_matches / len(gt_lines)
        else:
            line_accuracy = 0.0
        
        return {
            'character_accuracy': similarity_ratio * 100,
            'word_accuracy': word_accuracy * 100,
            'line_accuracy': line_accuracy * 100,
            'similarity_ratio': similarity_ratio
        }
    
    def extract_medicine_names(self, text):
        """Extract medicine names from OCR text"""
        # Simple extraction - look for common medicine names
        from generate_prescriptions import MEDICINES
        
        found_medicines = []
        text_lower = text.lower()
        
        for med in MEDICINES:
            if med['name'].lower() in text_lower:
                found_medicines.append(med['name'])
        
        return found_medicines
    
    def test_all_prescriptions(self):
        """Test OCR on all generated prescriptions"""
        print("=" * 70)
        print("  OCR Accuracy Testing on Synthetic Prescriptions")
        print("=" * 70)
        print()
        
        if not self.metadata:
            print("❌ No prescriptions found. Run generate_prescriptions.py first.")
            return
        
        results = []
        total_char_acc = 0
        total_word_acc = 0
        total_line_acc = 0
        
        quality_stats = {'high': [], 'medium': [], 'low': []}
        
        print(f"Testing {len(self.metadata)} prescriptions...")
        print()
        
        for i, item in enumerate(self.metadata):
            prescription_id = item['id']
            image_file = item['filename']
            label_file = item['label_file']
            quality = item['quality']
            
            # Paths
            image_path = os.path.join(self.prescriptions_dir, image_file)
            label_path = os.path.join(self.labels_dir, label_file)
            
            # Load ground truth
            with open(label_path, 'r', encoding='utf-8') as f:
                ground_truth = f.read()
            
            # Run OCR
            print(f"[{i+1}/{len(self.metadata)}] Testing {image_file}...", end=' ')
            ocr_result = self.run_tesseract_ocr(image_path)
            
            if ocr_result is None:
                print("SKIPPED (Tesseract not available)")
                continue
            
            # Calculate accuracy
            accuracy = self.calculate_accuracy(ground_truth, ocr_result)
            
            # Extract medicines
            gt_medicines = [med['name'] for med in item['data']['medicines']]
            ocr_medicines = self.extract_medicine_names(ocr_result)
            medicine_recall = len(set(gt_medicines).intersection(set(ocr_medicines))) / len(gt_medicines) if gt_medicines else 0
            
            # Store result
            result = {
                'id': prescription_id,
                'filename': image_file,
                'quality': quality,
                'accuracy': accuracy,
                'medicine_recall': medicine_recall * 100,
                'ground_truth_medicines': gt_medicines,
                'extracted_medicines': ocr_medicines
            }
            
            results.append(result)
            quality_stats[quality].append(accuracy['character_accuracy'])
            
            total_char_acc += accuracy['character_accuracy']
            total_word_acc += accuracy['word_accuracy']
            total_line_acc += accuracy['line_accuracy']
            
            print(f"✓ Char Acc: {accuracy['character_accuracy']:.1f}%")
        
        # Calculate averages
        if results:
            avg_char_acc = total_char_acc / len(results)
            avg_word_acc = total_word_acc / len(results)
            avg_line_acc = total_line_acc / len(results)
            
            print()
            print("=" * 70)
            print("  Test Results Summary")
            print("=" * 70)
            print()
            print(f"Total Prescriptions Tested: {len(results)}")
            print()
            print("Overall Accuracy:")
            print(f"  Character-level: {avg_char_acc:.2f}%")
            print(f"  Word-level:      {avg_word_acc:.2f}%")
            print(f"  Line-level:      {avg_line_acc:.2f}%")
            print()
            
            # Accuracy by quality
            print("Accuracy by Image Quality:")
            for quality in ['high', 'medium', 'low']:
                if quality_stats[quality]:
                    avg = sum(quality_stats[quality]) / len(quality_stats[quality])
                    count = len(quality_stats[quality])
                    print(f"  {quality.capitalize():6s}: {avg:.2f}% (n={count})")
            print()
            
            # Medicine extraction accuracy
            total_med_recall = sum(r['medicine_recall'] for r in results) / len(results)
            print(f"Medicine Name Extraction Recall: {total_med_recall:.2f}%")
            print()
            
            # Save detailed results
            results_file = os.path.join(self.results_dir, 'accuracy_results.json')
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'summary': {
                        'total_tested': len(results),
                        'avg_character_accuracy': avg_char_acc,
                        'avg_word_accuracy': avg_word_acc,
                        'avg_line_accuracy': avg_line_acc,
                        'avg_medicine_recall': total_med_recall,
                        'by_quality': {
                            quality: sum(accs) / len(accs) if accs else 0
                            for quality, accs in quality_stats.items()
                        }
                    },
                    'detailed_results': results
                }, f, indent=2)
            
            print(f"📊 Detailed results saved to: {results_file}")
            print()
            
            # Performance categorization
            print("Performance Assessment:")
            if avg_char_acc >= 85:
                print("  ✅ EXCELLENT - Ready for production use")
            elif avg_char_acc >= 70:
                print("  ✓  GOOD - Acceptable with manual verification")
            elif avg_char_acc >= 50:
                print("  ⚠️  FAIR - Needs improvement or better image preprocessing")
            else:
                print("  ❌ POOR - Consider fine-tuning or better image quality")
            print()
            
            return results
        else:
            print("❌ No results to display")
            return []


def main():
    tester = OCRTester()
    results = tester.test_all_prescriptions()
    
    if results:
        print("=" * 70)
        print("  Next Steps")
        print("=" * 70)
        print()
        print("1. Review results in: synthetic_prescriptions/ocr_results/")
        print("2. Use these images to demo the system")
        print("3. If accuracy is low:")
        print("   - Add image preprocessing (contrast, deskew)")
        print("   - Use higher quality synthetic images")
        print("   - Consider fine-tuning Tesseract (advanced)")
        print()


if __name__ == "__main__":
    main()
