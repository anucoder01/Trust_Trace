import os
import cv2
import numpy as np
from skimage.feature import hog
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

def extract_hog_features(image_path):
    # Read image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
        
    # Resize to fixed dimensions for consistent HOG features
    img = cv2.resize(img, (256, 128))
    
    # Apply thresholding to clean up signature
    _, img = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    
    # Extract HOG features
    features = hog(img, orientations=9, pixels_per_cell=(8, 8),
                   cells_per_block=(2, 2), block_norm='L2-Hys', visualize=False)
    
    return features

def load_dataset(data_dir):
    features = []
    labels = []
    
    genuine_dir = os.path.join(data_dir, 'genuine')
    forged_dir = os.path.join(data_dir, 'forged')
    
    # Load genuine signatures
    print("Loading genuine signatures...")
    if os.path.exists(genuine_dir):
        for img_name in os.listdir(genuine_dir):
            if img_name.endswith('.png') or img_name.endswith('.jpg'):
                feat = extract_hog_features(os.path.join(genuine_dir, img_name))
                if feat is not None:
                    features.append(feat)
                    labels.append(1) # 1 for genuine
                    
    # Load forged signatures
    print("Loading forged signatures...")
    if os.path.exists(forged_dir):
        for img_name in os.listdir(forged_dir):
            if img_name.endswith('.png') or img_name.endswith('.jpg'):
                feat = extract_hog_features(os.path.join(forged_dir, img_name))
                if feat is not None:
                    features.append(feat)
                    labels.append(0) # 0 for forged
                    
    return np.array(features), np.array(labels)

def train_model(data_dir, model_save_path):
    print(f"Starting training process using data from: {data_dir}")
    
    # Load and extract features
    X, y = load_dataset(data_dir)
    
    if len(X) == 0:
        print("No data found! Please ensure 'genuine' and 'forged' folders exist with images.")
        return
        
    print(f"Extracted features for {len(X)} images.")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize and train Ensemble Classifier
    print("Training Ensemble Classifier (SVM, RF, GradientBoosting, LogisticRegression, KNN)...")
    
    svm_clf = SVC(kernel='rbf', probability=True, C=10, gamma='scale')
    rf_clf = RandomForestClassifier(n_estimators=100, random_state=42)
    gb_clf = GradientBoostingClassifier(n_estimators=50, random_state=42)
    lr_clf = LogisticRegression(max_iter=1000, random_state=42)
    knn_clf = KNeighborsClassifier(n_neighbors=3)
    
    clf = VotingClassifier(
        estimators=[
            ('svm', svm_clf),
            ('rf', rf_clf),
            ('gb', gb_clf),
            ('lr', lr_clf),
            ('knn', knn_clf)
        ],
        voting='soft'
    )
    
    clf.fit(X_train, y_train)
    
    # Evaluate model
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Forged', 'Genuine']))
    
    # Save model
    joblib.dump(clf, model_save_path)
    print(f"Model saved successfully to {model_save_path}")

if __name__ == "__main__":
    # Assuming dataset is downloaded and extracted to this directory structure
    # Expected structure: 
    # dataset/
    #   genuine/
    #   forged/
    DATA_DIR = "./dataset"
    MODEL_PATH = "signature_svm_model.pkl"
    
    # Create dummy directories if they don't exist just to prevent errors
    # In a real scenario, the user will place the Kaggle dataset here
    os.makedirs(os.path.join(DATA_DIR, "genuine"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "forged"), exist_ok=True)
    
    train_model(DATA_DIR, MODEL_PATH)
