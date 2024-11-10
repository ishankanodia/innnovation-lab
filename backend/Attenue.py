import cv2
import face_recognition
import sys
import pickle
import os

# Path to the saved embeddings file
embeddings_file = 'face_embeddings.pkl'

# Load the saved embeddings and names
if os.path.exists(embeddings_file):
    with open(embeddings_file, 'rb') as f:
        data = pickle.load(f)
        encodeListKnown = data['encodings']
        classNames = data['names']
else:
    print("Embeddings file not found. Please run calculate_embeddings.py first.")
    sys.exit(1)

# Load the uploaded image for recognition
imagePath = sys.argv[1]  # Expecting the image path as a command-line argument
if imagePath is None:
    print("Error: Could not read the image. Check file path or integrity.")
else:
    print("Image loaded successfully"),
unknown_image = cv2.imread(imagePath)

if unknown_image is None:
    print("Error: Image not found.")
    sys.exit(1)

# Convert color for face recognition processing
unknown_image_rgb = cv2.cvtColor(unknown_image, cv2.COLOR_BGR2RGB)

# Find face locations and encodings in the uploaded image
face_locations = face_recognition.face_locations(unknown_image_rgb)
face_encodings = face_recognition.face_encodings(unknown_image_rgb, face_locations)

recognized_names = []

# Compare found faces with known faces
for face_encoding, face_loc in zip(face_encodings, face_locations):
    matches = face_recognition.compare_faces(encodeListKnown, face_encoding)
    face_distances = face_recognition.face_distance(encodeListKnown, face_encoding)
    
    if len(face_distances) > 0:
        best_match_index = face_distances.argmin()
        if matches[best_match_index]:
            name = classNames[best_match_index].upper()
        else:
            name = "UNKNOWN"
        
        # Add recognized name to the list
        recognized_names.append(name)

        # Draw rectangle and label around the face
        y1, x2, y2, x1 = face_loc
        cv2.rectangle(unknown_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.rectangle(unknown_image, (x1, y2 - 35), (x2, y2), (0, 255, 0), cv2.FILLED)
        cv2.putText(unknown_image, name, (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)

# Output the recognized names
if recognized_names:
    for name in recognized_names:
        print(name)
else:
    print("No recognized faces found.")
