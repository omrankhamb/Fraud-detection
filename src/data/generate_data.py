import numpy as np
import pandas as pd
from pathlib import Path


def generate_synthetic_transactions(n_samples: int = 10000, fraud_ratio: float = 0.015, random_state: int = 42) -> pd.DataFrame:
    """
    Generate synthetic transaction data mimicking financial transactions:
    - Time: Seconds elapsed
    - Amount: Transaction amount
    - V1-V10: PCA-like anonymized features
    - Class: 0 for normal, 1 for fraudulent
    """
    rng = np.random.RandomState(random_state)
    n_fraud = int(n_samples * fraud_ratio)
    n_normal = n_samples - n_fraud

    # Generate normal transactions
    normal_amounts = rng.exponential(scale=50.0, size=n_normal) + 1.0
    normal_pca = rng.normal(loc=0.0, scale=1.0, size=(n_normal, 10))
    normal_time = np.sort(rng.uniform(0, 86400, size=n_normal))

    # Generate fraudulent transactions (skewed amounts and anomalous distributions)
    fraud_amounts = rng.choice([rng.exponential(scale=250.0, size=n_fraud), rng.uniform(1.0, 5.0, size=n_fraud)])[0]
    fraud_pca = rng.normal(loc=2.2, scale=1.8, size=(n_fraud, 10))
    fraud_time = np.sort(rng.uniform(0, 86400, size=n_fraud))

    # Assemble datasets
    normal_df = pd.DataFrame(normal_pca, columns=[f"V{i}" for i in range(1, 11)])
    normal_df["Time"] = normal_time
    normal_df["Amount"] = np.round(normal_amounts, 2)
    normal_df["Class"] = 0

    fraud_df = pd.DataFrame(fraud_pca, columns=[f"V{i}" for i in range(1, 11)])
    fraud_df["Time"] = fraud_time
    fraud_df["Amount"] = np.round(fraud_amounts, 2)
    fraud_df["Class"] = 1

    df = pd.concat([normal_df, fraud_df], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df


if __name__ == "__main__":
    output_dir = Path(__file__).resolve().parent.parent.parent / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "sample_transactions.csv"
    
    print(f"Generating synthetic transaction dataset...")
    df = generate_synthetic_transactions(n_samples=20000, fraud_ratio=0.02)
    df.to_csv(output_file, index=False)
    print(f"Saved {len(df)} transactions ({df['Class'].sum()} frauds) to {output_file}")
