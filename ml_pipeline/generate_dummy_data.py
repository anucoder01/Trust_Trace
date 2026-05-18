import os
import cv2
import numpy as np

def generate_dummy_signature(output_path, is_genuine, seed=None):
    if seed is not None:
        np.random.seed(seed)
        
    # Create white background
    img = np.ones((128, 256, 3), dtype=np.uint8) * 255
    
    # Generate random points for signature
    num_points = np.random.randint(5, 12) if is_genuine else np.random.randint(8, 20)
    
    points = []
    # Start on the left side
    curr_x = np.random.randint(20, 50)
    curr_y = np.random.randint(40, 90)
    points.append([curr_x, curr_y])
    
    for i in range(num_points):
        curr_x += np.random.randint(10, 40)
        curr_y += np.random.randint(-30, 30)
        
        # Keep within bounds
        curr_y = max(10, min(118, curr_y))
        curr_x = min(246, curr_x)
        points.append([curr_x, curr_y])
        
        if curr_x >= 230:
            break
            
    points = np.array(points, np.int32)
    
    # Genuine signatures are smoother
    if is_genuine:
        # Draw smooth curves using B-spline or similar, here we approximate with thick lines
        cv2.polylines(img, [points], False, (0, 0, 0), thickness=2, lineType=cv2.LINE_AA)
        
        # Add some random smooth loops
        for pt in points[1:-1]:
            if np.random.rand() > 0.6:
                cv2.circle(img, tuple(pt), np.random.randint(3, 8), (0, 0, 0), 2, lineType=cv2.LINE_AA)
    else:
        # Forged signatures are jagged and have hesitation marks (dots)
        for i in range(len(points) - 1):
            # Draw straight, jagged lines
            cv2.line(img, tuple(points[i]), tuple(points[i+1]), (0, 0, 0), 2)
            # Add hesitation blotting
            if np.random.rand() > 0.4:
                cv2.circle(img, tuple(points[i]), np.random.randint(1, 4), (0, 0, 0), -1)
                
    cv2.imwrite(output_path, img)

def create_dataset(base_dir, num_samples=20):
    genuine_dir = os.path.join(base_dir, "genuine")
    forged_dir = os.path.join(base_dir, "forged")
    
    os.makedirs(genuine_dir, exist_ok=True)
    os.makedirs(forged_dir, exist_ok=True)
    
    print(f"Generating {num_samples} genuine and {num_samples} forged signatures...")
    
    for i in range(num_samples):
        # Genuine
        generate_dummy_signature(os.path.join(genuine_dir, f"gen_{i+1:03d}.png"), True, seed=i)
        # Forged
        generate_dummy_signature(os.path.join(forged_dir, f"forg_{i+1:03d}.png"), False, seed=i+1000)
        
    print(f"Dataset generated at: {os.path.abspath(base_dir)}")

if __name__ == "__main__":
    create_dataset("dataset", num_samples=50)
