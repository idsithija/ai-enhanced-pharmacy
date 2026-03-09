"""
PaddleOCR Recognition Model Fine-Tuning Script
================================================
Fine-tunes PP-OCRv4 English recognition model on custom prescription data.

Steps:
  1. Clones PaddleOCR repo (for training tools)
  2. Downloads pretrained PP-OCRv4 English rec model
  3. Generates training config YAML
  4. Runs fine-tuning
  5. Exports inference model

Usage:
  python train_model.py              # Full pipeline
  python train_model.py --skip-clone # Skip repo clone if already done
  python train_model.py --export-only # Only export (after training)
"""

import os
import sys
import subprocess
import shutil
import argparse
import yaml
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent  # ml-models/prescription-ocr/
PADDLEOCR_DIR = BASE_DIR / "PaddleOCR"
PRETRAINED_DIR = BASE_DIR / "pretrained"
OUTPUT_DIR = BASE_DIR / "model"
TRAINING_DATA_DIR = BASE_DIR / "training_data"

# PP-OCRv4 English rec model
PRETRAINED_URL = "https://paddleocr.bj.bcebos.com/PP-OCRv4/english/en_PP-OCRv4_rec_train.tar"
PRETRAINED_MODEL_NAME = "en_PP-OCRv4_rec_train"

# Training hyperparameters
EPOCHS = 100
BATCH_SIZE = 64
LEARNING_RATE = 0.0005
SAVE_EPOCH_STEP = 10
EVAL_BATCH_STEP = 200
LOG_SMOOTH_WINDOW = 20


def run_cmd(cmd, cwd=None, check=True):
    """Run a command and stream output."""
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if check and result.returncode != 0:
        print(f"Command failed with return code {result.returncode}")
        sys.exit(1)
    return result


def clone_paddleocr():
    """Clone PaddleOCR repository (shallow)."""
    if PADDLEOCR_DIR.exists():
        print(f"PaddleOCR repo already exists at {PADDLEOCR_DIR}")
        return

    print("Cloning PaddleOCR repository (shallow clone)...")
    run_cmd(
        f'git clone --depth 1 -b release/2.7 '
        f'https://github.com/PaddlePaddle/PaddleOCR.git "{PADDLEOCR_DIR}"'
    )
    # Install PaddleOCR's requirements
    req_file = PADDLEOCR_DIR / "requirements.txt"
    if req_file.exists():
        run_cmd(f'pip install -r "{req_file}"', check=False)


def download_pretrained():
    """Download pretrained PP-OCRv4 rec model."""
    PRETRAINED_DIR.mkdir(parents=True, exist_ok=True)
    model_dir = PRETRAINED_DIR / PRETRAINED_MODEL_NAME

    if model_dir.exists() and any(model_dir.glob("*.pdparams")):
        print(f"Pretrained model already exists at {model_dir}")
        return model_dir

    tar_file = PRETRAINED_DIR / f"{PRETRAINED_MODEL_NAME}.tar"
    print(f"Downloading pretrained model from {PRETRAINED_URL}...")

    # Try wget first, then curl, then Python
    if shutil.which("wget"):
        run_cmd(f'wget -O "{tar_file}" "{PRETRAINED_URL}"')
    elif shutil.which("curl"):
        run_cmd(f'curl -L -o "{tar_file}" "{PRETRAINED_URL}"')
    else:
        import urllib.request
        print("Downloading with Python urllib (may be slow)...")
        urllib.request.urlretrieve(PRETRAINED_URL, str(tar_file))

    print("Extracting...")
    import tarfile
    with tarfile.open(tar_file, 'r') as tf:
        tf.extractall(path=str(PRETRAINED_DIR))
    tar_file.unlink()

    print(f"Pretrained model ready at {model_dir}")
    return model_dir


def count_dict_chars():
    """Count characters in dictionary file."""
    dict_file = TRAINING_DATA_DIR / "en_dict.txt"
    if not dict_file.exists():
        print("ERROR: Dictionary file not found. Run generate_training_data.py first!")
        sys.exit(1)
    with open(dict_file, 'r', encoding='utf-8') as f:
        chars = f.read().strip().split('\n')
    return len(chars)


def create_training_config(pretrained_model_dir, epochs=EPOCHS, batch_size=BATCH_SIZE, learning_rate=LEARNING_RATE):
    """Create PaddleOCR training YAML configuration."""
    num_chars = count_dict_chars()
    # +2 for blank and unknown tokens in CTC
    num_classes = num_chars + 2

    # Detect GPU availability
    try:
        import paddle
        has_gpu = paddle.device.is_compiled_with_cuda()
    except Exception:
        has_gpu = False

    config = {
        'Global': {
            'debug': False,
            'use_gpu': has_gpu,
            'epoch_num': epochs,
            'log_smooth_window': LOG_SMOOTH_WINDOW,
            'print_batch_step': 10,
            'save_model_dir': str(OUTPUT_DIR / "training_output"),
            'save_epoch_step': SAVE_EPOCH_STEP,
            'eval_batch_step': [0, EVAL_BATCH_STEP],
            'cal_metric_during_train': True,
            'pretrained_model': str(pretrained_model_dir / "best_accuracy"),
            'checkpoints': None,
            'save_inference_dir': str(OUTPUT_DIR / "inference"),
            'use_visualdl': False,
            'infer_img': None,
            'character_dict_path': str(TRAINING_DATA_DIR / "en_dict.txt"),
            'max_text_length': 80,
            'infer_mode': False,
            'use_space_char': True,
            'distributed': False,
            'save_res_path': str(OUTPUT_DIR / "rec_results.txt"),
        },
        'Optimizer': {
            'name': 'Adam',
            'beta1': 0.9,
            'beta2': 0.999,
            'lr': {
                'name': 'Cosine',
                'learning_rate': learning_rate,
                'warmup_epoch': 5,
            },
            'regularizer': {
                'name': 'L2',
                'factor': 3.0e-5,
            },
        },
        'Architecture': {
            'model_type': 'rec',
            'algorithm': 'SVTR_LCNet',
            'Transform': None,
            'Backbone': {
                'name': 'PPLCNetV3',
                'scale': 0.95,
            },
            'Head': {
                'name': 'MultiHead',
                'head_list': [
                    {
                        'CTCHead': {
                            'Neck': {
                                'name': 'svtr',
                                'dims': 120,
                                'depth': 2,
                                'hidden_dims': 120,
                                'kernel_size': [1, 3],
                                'use_guide': True,
                            },
                            'Head': {
                                'fc_decay': 1.0e-5,
                            },
                        }
                    },
                    {
                        'NRTRHead': {
                            'nrtr_dim': 384,
                            'max_text_length': 80,
                        }
                    },
                ],
                'out_channels_list': {
                    'CTCLabelDecode': num_classes,
                    'NRTRLabelDecode': num_classes,
                },
            },
        },
        'Loss': {
            'name': 'MultiLoss',
            'loss_config_list': [
                {'CTCLoss': None},
                {'NRTRLoss': None},
            ],
        },
        'PostProcess': {
            'name': 'CTCLabelDecode',
        },
        'Metric': {
            'name': 'RecMetric',
            'main_indicator': 'acc',
            'ignore_space': False,
        },
        'Train': {
            'dataset': {
                'name': 'SimpleDataSet',
                'data_dir': str(TRAINING_DATA_DIR),
                'ext_op_transform_idx': 1,
                'label_file_list': [str(TRAINING_DATA_DIR / "train_label.txt")],
                'transforms': [
                    {'DecodeImage': {'img_mode': 'BGR', 'channel_first': False}},
                    {'RecConAug': {
                        'prob': 0.5,
                        'ext_data_num': 2,
                        'image_shape': [48, 320, 3],
                        'max_text_length': 80,
                    }},
                    {'RecAug': None},
                    {'MultiLabelEncode': {
                        'gtc_encode': 'NRTRLabelEncode',
                    }},
                    {'RecResizeImg': {'image_shape': [3, 48, 320]}},
                    {'KeepKeys': {'keep_keys': ['image', 'label_ctc', 'label_gtc', 'length', 'valid_ratio']}},
                ],
            },
            'loader': {
                'shuffle': True,
                'batch_size_per_card': batch_size,
                'drop_last': True,
                'num_workers': 4,
            },
        },
        'Eval': {
            'dataset': {
                'name': 'SimpleDataSet',
                'data_dir': str(TRAINING_DATA_DIR),
                'label_file_list': [str(TRAINING_DATA_DIR / "val_label.txt")],
                'transforms': [
                    {'DecodeImage': {'img_mode': 'BGR', 'channel_first': False}},
                    {'MultiLabelEncode': {
                        'gtc_encode': 'NRTRLabelEncode',
                    }},
                    {'RecResizeImg': {'image_shape': [3, 48, 320]}},
                    {'KeepKeys': {'keep_keys': ['image', 'label_ctc', 'label_gtc', 'length', 'valid_ratio']}},
                ],
            },
            'loader': {
                'shuffle': False,
                'drop_last': False,
                'batch_size_per_card': batch_size,
                'num_workers': 4,
            },
        },
    }

    config_path = OUTPUT_DIR / "rec_prescription_train.yml"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(config_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    print(f"Training config saved to {config_path}")
    return config_path


def train(config_path):
    """Run PaddleOCR recognition training."""
    tools_dir = PADDLEOCR_DIR / "tools"
    if not tools_dir.exists():
        print("ERROR: PaddleOCR tools not found. Run with --clone first!")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("STARTING TRAINING")
    print("=" * 60)

    train_script = tools_dir / "train.py"
    run_cmd(
        f'python "{train_script}" -c "{config_path}"',
        cwd=str(PADDLEOCR_DIR)
    )
    print("\nTraining complete!")


def export_model(config_path):
    """Export trained model for inference."""
    tools_dir = PADDLEOCR_DIR / "tools"
    export_script = tools_dir / "export_model.py"

    training_output = OUTPUT_DIR / "training_output"
    best_model = training_output / "best_accuracy"
    latest_model = training_output / "latest"

    # Find best checkpoint
    checkpoint = None
    if best_model.exists() or Path(str(best_model) + ".pdparams").exists():
        checkpoint = str(best_model)
    elif latest_model.exists() or Path(str(latest_model) + ".pdparams").exists():
        checkpoint = str(latest_model)
    else:
        print("ERROR: No trained model found! Run training first.")
        sys.exit(1)

    inference_dir = OUTPUT_DIR / "inference"
    print(f"\nExporting model from: {checkpoint}")
    print(f"Export to: {inference_dir}")

    run_cmd(
        f'python "{export_script}" '
        f'-c "{config_path}" '
        f'-o Global.pretrained_model="{checkpoint}" '
        f'Global.save_inference_dir="{inference_dir}"',
        cwd=str(PADDLEOCR_DIR)
    )
    print(f"\nInference model exported to {inference_dir}")


def main():
    parser = argparse.ArgumentParser(description="Train PaddleOCR recognition model")
    parser.add_argument("--skip-clone", action="store_true", help="Skip cloning PaddleOCR repo")
    parser.add_argument("--export-only", action="store_true", help="Only export model (skip training)")
    parser.add_argument("--epochs", type=int, default=EPOCHS, help=f"Number of epochs (default: {EPOCHS})")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, help=f"Batch size (default: {BATCH_SIZE})")
    parser.add_argument("--lr", type=float, default=LEARNING_RATE, help=f"Learning rate (default: {LEARNING_RATE})")
    args = parser.parse_args()

    epochs = args.epochs
    batch_size = args.batch_size
    learning_rate = args.lr

    # Verify training data exists
    if not (TRAINING_DATA_DIR / "train_label.txt").exists():
        print("ERROR: Training data not found!")
        print("Run: python training/generate_training_data.py")
        sys.exit(1)

    print("=" * 60)
    print("PaddleOCR RECOGNITION MODEL TRAINING")
    print("=" * 60)
    print(f"   Epochs:     {epochs}")
    print(f"   Batch size: {batch_size}")
    print(f"   LR:         {learning_rate}")
    print(f"   Data dir:   {TRAINING_DATA_DIR}")
    print(f"   Output dir: {OUTPUT_DIR}")
    print()

    # Step 1: Clone PaddleOCR
    if not args.skip_clone and not args.export_only:
        clone_paddleocr()

    # Step 2: Download pretrained model
    pretrained_dir = download_pretrained()

    # Step 3: Create config
    config_path = create_training_config(pretrained_dir, epochs=epochs, batch_size=batch_size, learning_rate=learning_rate)

    if args.export_only:
        export_model(config_path)
        return

    # Step 4: Train
    train(config_path)

    # Step 5: Export
    export_model(config_path)

    print("\n" + "=" * 60)
    print("ALL DONE!")
    print(f"   Inference model: {OUTPUT_DIR / 'inference'}")
    print("   Use this model in api_service.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
