# Attenue.py
import cv2
import face_recognition
import sys
import os

path = './uploads'  # Path where the images are uploaded

images = []
classNames = []
myList = os.listdir(path)
for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    if curImg is None:
        continue
    images.append(curImg)
    classNames.append(os.path.splitext(cl)[0])

# Function to find encodings of faces in the images
def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)
        if encode:  # Ensure there is at least one encoding
            encodeList.append(encode[0])
    return encodeList

# Encode known faces
encodeListKnown = findEncodings(images)

# Load the image passed from the backend
imagePath = sys.argv[1]
unknown_image = cv2.imread(imagePath)
unknown_image_rgb = cv2.cvtColor(unknown_image, cv2.COLOR_BGR2RGB)

# Find encodings in the uploaded image
face_locations = face_recognition.face_locations(unknown_image_rgb)
face_encodings = face_recognition.face_encodings(unknown_image_rgb, face_locations)

recognized_names = []

# Compare faces
for face_encoding in face_encodings:
    matches = face_recognition.compare_faces(encodeListKnown, face_encoding)
    face_distances = face_recognition.face_distance(encodeListKnown, face_encoding)
    
    if len(face_distances) > 0:
        best_match_index = face_distances.argmin()
        if matches[best_match_index]:
            name = classNames[best_match_index].upper()
            recognized_names.append(name)

# Output the recognized names to the console
for name in recognized_names:
    print(name)
