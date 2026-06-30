# TrustTrace

**Banking-Grade Signature Detection and Verification Using Machine Learning and Computer Vision**

TrustTrace is a state-of-the-art, multi-layered signature verification platform designed to secure financial ecosystems against advanced document forgery. Unlike traditional static template-matching systems, TrustTrace utilizes a dual-layered verification architecture combining robust static shape analysis, microscopic CV tremor inspection, and dynamic biometric tracking.

## Overview
The financial and banking sectors rely heavily on signatures for high-value transactions. Manual verification is prone to fatigue and subjective bias, while standard machine learning models struggle to detect skilled tracings. 

TrustTrace bridges these gaps by analyzing both the geometric structure of a signature and the physical mechanics of handwriting (such as micro-tremors, stroke continuity, ink pooling, and drawing velocity). Built with a high-performance **FastAPI** backend and an interactive **Three.js**-powered frontend dashboard, it provides real-time verdicts, Explainable AI heatmaps, and comprehensive transaction risk scores.

---

## Key Features

1. **Dual-Layered Verification**
   - **Static Analysis:** Extracts Histogram of Oriented Gradients (HOG) features from scanned images.
   - **Dynamic Tracking:** LSTM/GRU temporal models analyze stroke coordinates, lifts, and speed variation for digital entries.

2. **Soft-Voting Ensemble Model**
   - Employs five classifiers: Support Vector Machine (SVM), Random Forest, Gradient Boosting, Logistic Regression, and K-Nearest Neighbors (KNN). This ensemble approach yields highly accurate spatial match verdicts.

3. **OpenCV Micro-Tremor Engine**
   - Calculates **Edge Jitter Ratio** to detect hand tremors typical of slow tracing.
   - Computes **Ink Blot Ratio** to identify hesitation pauses through localized pools of thick ink.

4. **Prototypical Adaptive Learning (Few-Shot)**
   - Monitors natural signature drift over time. It continuously updates the user's profile centroid in the latent space, avoiding the need for complete model retraining.

5. **Explainable AI (XAI) Heatmaps**
   - Generates pseudo Grad-CAM heatmaps highlighting abnormal stroke densities and anomalies, providing visual evidence to tellers.

6. **Multimodal Financial Risk Engine**
   - Fuses visual authenticity scores with contextual transaction metadata (amount, location, flags, account history) using a Bayesian weighting process to compute a final risk index.

7. **Interactive Dashboard**
   - Real-time HTML5 canvas pads, 3D particle animations, and detailed verification analytics in the teller UI.

---

## The TrustTrace Advantage (Pros)

- **Comprehensive Security:** Defends against both casual forgeries (via shape analysis) and skilled traced forgeries (via tremor and rhythm analysis).
- **Adaptable & Future-Proof:** Automatically adjusts to changes in a user's handwriting over time without skyrocketing False Rejection Rates (FRR).
- **Transparent Decisions:** Does not act as a "black box." Visual heatmaps explain precisely *why* a signature is flagged.
- **Context-Aware:** Evaluates the risk of the transaction holistically rather than just looking at the signature in isolation.
- **Accessible Deployment:** Engineered to run efficiently without requiring heavy, expensive GPU infrastructure at every bank teller's desk.

---

## How It Outperforms Existing Systems

| Feature / Capability | Traditional Systems | Deep CNN Models | TrustTrace |
|----------------------|----------------------|-----------------|------------|
| **Traced Forgery Detection** | Poor (Foiled by overlays) | Moderate | **Excellent** (Micro-tremor CV) |
| **Explanation of Results** | None (Binary verdict) | Black-Box | **High** (Visual Heatmaps) |
| **Signature Drift Handling** | Static (High false rejects) | Requires Retraining | **Dynamic** (Adaptive Latent Centroids) |
| **Context Integration** | Isolated | Isolated | **Integrated** (Bayesian Risk Engine) |
| **Hardware Requirements** | Low | High (Dedicated GPUs) | **Optimized** (Runs locally via FastAPI) |

---

## Project Structure

- **Frontend:** HTML, CSS (`style.css`), JS (`app.js`) - Contains the Teller Dashboard and interactive elements.
- **Backend/ML:** Python pipeline in `ml_pipeline/` - Includes the FastAPI service, Computer Vision core, and Machine Learning models.
- **Documentation:** VTU Project Reports (`TRUSTTRACE_REPORT.*`) detailing the methodology, architecture, and results.

## Setup & Execution

### Prerequisites
- Python 3.8+
- A modern web browser

### Backend (ML Pipeline)

1. **Navigate to the `ml_pipeline` directory:**
   ```bash
   cd ml_pipeline
   ```

2. **(Optional) Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **(Optional) Generate Data & Train the Model:**
   *Note: A pre-trained `signature_svm_model.pkl` is already included. You only need to run these if you wish to train the model from scratch.*
   ```bash
   python generate_dummy_data.py
   python train.py
   ```

5. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will now be running at `http://127.0.0.1:8000`.

### Frontend (Dashboard)

The frontend is built with plain HTML, CSS, and JS. It requires no complex build tools.

1. **Open the Application:**
   Simply double-click `index.html` in the root directory of the project to open it in your web browser.
   
   *Alternatively, you can serve it via a simple local server:*
   ```bash
   # In the root directory (where index.html is located)
   python -m http.server 3000
   ```
   Then navigate to `http://localhost:3000` in your browser.

2. **Usage:**
   Ensure the FastAPI backend is running simultaneously so the dashboard can communicate with the ML pipeline to verify signatures.
