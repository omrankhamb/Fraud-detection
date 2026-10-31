"""
MuRIL (Multilingual Representations for Indic Languages) Fine-Tuning Pipeline.

Fine-tunes 'google/muril-base-cased' for scam message classification across
Hindi, Marathi, Hinglish, and English.

Settings (CBL-01 Specification):
- Model: google/muril-base-cased
- Max Length: 128 tokens
- Learning Rate: 2e-5
- Weight Decay: 0.01
- Loss: Class-weighted Cross-Entropy (for imbalanced scam distribution)
- Early Stopping: Monitored on Validation Macro-F1
"""

import argparse
from pathlib import Path
import sys
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
import torch
from torch.utils.data import DataLoader, Dataset

try:
    from transformers import (
        AutoModelForSequenceClassification,
        AutoTokenizer,
        Trainer,
        TrainingArguments,
    )
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "clean" / "unified_scam_dataset.csv"
OUTPUT_DIR = PROJECT_ROOT / "models" / "muril_finetuned"


class ScamTextDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = list(texts)
        self.labels = list(labels)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = int(self.labels[idx])
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt"
        )
        item = {key: val.squeeze(0) for key, val in encoding.items()}
        item["labels"] = torch.tensor(label, dtype=torch.long)
        return item


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    macro_f1 = f1_score(labels, preds, average="macro")
    scam_f1 = f1_score(labels, preds, pos_label=1, zero_division=0)
    precision = precision_score(labels, preds, pos_label=1, zero_division=0)
    recall = recall_score(labels, preds, pos_label=1, zero_division=0)
    return {
        "macro_f1": macro_f1,
        "scam_f1": scam_f1,
        "precision": precision,
        "recall": recall,
    }


def train_muril(
    data_path: Path = DATA_PATH,
    model_name: str = "google/muril-base-cased",
    epochs: int = 3,
    batch_size: int = 16,
    lr: float = 2e-5,
    sample_limit: int = None,
):
    print("==================================================================")
    print("      CBL-01 MuRIL MULTILINGUAL TRANSFORMER FINE-TUNING          ")
    print("==================================================================")

    if not HAS_TRANSFORMERS:
        print("Error: transformers library is not installed.")
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device} | CUDA Available: {torch.cuda.is_available()}")

    df = pd.read_csv(data_path)
    if sample_limit and sample_limit < len(df):
        print(f"Subsampling to {sample_limit} instances for rapid fine-tuning on CPU...")
        df = df.sample(n=sample_limit, random_state=42).reset_index(drop=True)

    print(f"Loaded {len(df)} samples from {data_path.name}")
    print(f"Class Distribution:\n{df['label'].value_counts(normalize=True).round(3)}")

    # Train / Val Split
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        df["cleaned_text"], df["label"], test_size=0.20, random_state=42, stratify=df["label"]
    )

    print(f"Loading Tokenizer & Pretrained Model: {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    model.to(device)

    train_dataset = ScamTextDataset(train_texts, train_labels, tokenizer)
    val_dataset = ScamTextDataset(val_texts, val_labels, tokenizer)

    training_args = TrainingArguments(
        output_dir=str(OUTPUT_DIR),
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        learning_rate=lr,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="macro_f1",
        greater_is_better=True,
        logging_steps=50,
        save_total_limit=1,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
    )

    print("\nStarting MuRIL fine-tuning...")
    trainer.train()

    print("\nEvaluating on Validation Set...")
    eval_results = trainer.evaluate()
    print("Evaluation Results:", eval_results)

    # Save fine-tuned checkpoint
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(OUTPUT_DIR))
    tokenizer.save_pretrained(str(OUTPUT_DIR))
    print(f"\nSuccessfully saved fine-tuned MuRIL model to: {OUTPUT_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Fine-tune MuRIL for CBL-01 Scam Detection")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=8, help="Batch size (use 8 or 16 for CPU)")
    parser.add_argument("--lr", type=float, default=2e-5, help="Learning rate")
    parser.add_argument("--sample_limit", type=int, default=None, help="Optional subset size for fast local testing")
    args = parser.parse_args()

    train_muril(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        sample_limit=args.sample_limit,
    )


if __name__ == "__main__":
    main()
