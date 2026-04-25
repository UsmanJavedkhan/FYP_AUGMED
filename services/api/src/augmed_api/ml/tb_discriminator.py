"""3-class CXR classifier: Healthy / Pneumonia / Tuberculosis.

Uses a logistic regression trained on DenseNet121 pathology score patterns
from labeled Wikimedia Commons CXR images (healthy, pneumonia, TB).

The model was trained on StandardScaler-normalized DenseNet features and
the weights are embedded here so no external model file is needed.
"""
from __future__ import annotations

import logging

import numpy as np

logger = logging.getLogger(__name__)

# Pathology order expected (densenet121-res224-all):
#  0: Atelectasis      6: Fibrosis            12: Mass
#  1: Consolidation    7: Effusion            13: Hernia
#  2: Infiltration     8: Pneumonia           14: Lung Lesion
#  3: Pneumothorax     9: Pleural_Thickening  15: Fracture
#  4: Edema           10: Cardiomegaly        16: Lung Opacity
#  5: Emphysema       11: Nodule              17: Enlarged Cardiomediastinum

# StandardScaler parameters (fit on training set)
_SCALER_MEAN = np.array([
    0.5887215733528137, 0.6210502440279181, 0.6207252253185619,
    0.6157889095219699, 0.5430440469221636, 0.5894764878533103,
    0.6244219270619479, 0.5806927572597157, 0.5409151965921576,
    0.6016166101802479, 0.5695143071087924, 0.6345909888094122,
    0.6379795291207053, 0.5222198963165283, 0.5680414763363925,
    0.5890266624363986, 0.652099690654061,  0.6115367358381097,
], dtype=np.float64)

_SCALER_SCALE = np.array([
    0.06588858513390443, 0.029687696505048797, 0.020127236681685312,
    0.030562601125284347, 0.05219396647298641, 0.041807023944681915,
    0.011070787735919248, 0.06532499992972209, 0.0502604385906273,
    0.028562265532081188, 0.07050611310849378, 0.023439161852682175,
    0.03472824887893331, 0.038061894999462546, 0.04522246039999823,
    0.04859972194772399, 0.05346944053247357, 0.03629496790772231,
], dtype=np.float64)

# Logistic regression coefficients: classes = [healthy, pneumonia, tuberculosis]
_COEF = np.array([
    # healthy
    [-0.0956288263651559, -0.17535274065322404, -0.019301543484225296,
     -0.008362995713581943, -0.03054693122104898, -0.1876033817272981,
     -0.031061452192187398, -0.048885720233914666, -0.04245467528179808,
     0.1421652197122356, -0.06557285045657198, -0.16078329743288047,
     -0.32252649073695, -0.05270942895784537, -0.12565286257178243,
     -0.1499259862753787, -0.21017582413648034, -0.2989767617869219],
    # pneumonia
    [0.011564540351191324, 0.40925587507950384, 0.11094596765303308,
     -0.33156967726004066, -0.04194032957509144, 0.5981549193652455,
     0.1161205157649313, -0.03373768897401513, 0.17913227503326035,
     -0.23483422832407552, 0.3002624147751696, -0.14722233191412806,
     0.2832367325030161, -0.2870695700277293, -0.26416545375083517,
     -0.1952731329915943, -0.15370149496795094, 0.04861106021493926],
    # tuberculosis
    [0.08406428601396478, -0.23390313442627983, -0.09164442416880793,
     0.3399326729736225, 0.07248726079614048, -0.41055153763794744,
     -0.08505906357274384, 0.08262340920793002, -0.1366775997514624,
     0.09266900861184023, -0.2346895643185975, 0.3080056293470084,
     0.039289758233933804, 0.33977899898557457, 0.3898183163226175,
     0.3451991192669732, 0.3638773191044313, 0.2503657015719826],
], dtype=np.float64)

_INTERCEPT = np.array([
    -2.1076982128485855,  # healthy
     0.4952074831375549,  # pneumonia
     1.6124907297110314,  # tuberculosis
], dtype=np.float64)

_CLASSES = ["Healthy", "Pneumonia", "Tuberculosis"]


def classify_3class(raw_scores: dict[str, float], pathology_order: list[str]) -> tuple[str, float]:
    """Classify a CXR as Healthy, Pneumonia, or Tuberculosis.

    Args:
        raw_scores: Dict of pathology name → probability from DenseNet.
        pathology_order: List of pathology names in model output order.

    Returns:
        (label, confidence) tuple.
    """
    # Build feature vector in the correct order.
    x = np.array([raw_scores.get(p, 0.5) for p in pathology_order], dtype=np.float64)

    # StandardScaler transform.
    x_scaled = (x - _SCALER_MEAN) / _SCALER_SCALE

    # Logistic regression: softmax(X @ W^T + b)
    logits = _COEF @ x_scaled + _INTERCEPT
    exp_logits = np.exp(logits - logits.max())  # numerically stable softmax
    probs = exp_logits / exp_logits.sum()

    idx = int(probs.argmax())
    label = _CLASSES[idx]
    confidence = float(probs[idx])

    logger.info(
        "3-class probs — Healthy: %.4f, Pneumonia: %.4f, TB: %.4f → %s",
        probs[0], probs[1], probs[2], label,
    )

    return label, confidence


# Keep backward compat for the old interface name
def discriminate_tb_vs_pneumonia(raw_scores: dict[str, float], pathology_order: list[str]) -> str:
    """Legacy interface — returns just the label."""
    label, _ = classify_3class(raw_scores, pathology_order)
    return label
