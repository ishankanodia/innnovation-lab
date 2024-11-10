import cv2
import face_recognition
import os
import pickle

# Path to the folder containing known faces
path = '/Users/ishankanodia/Google Drive/My Drive/Students'
embeddings_file = 'face_embeddings.pkl'  # File to save the embeddings

# Load known images and their names
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

# Compute embeddings and save them
encodeListKnown = findEncodings(images)
with open(embeddings_file, 'wb') as f:
    pickle.dump({'encodings': encodeListKnown, 'names': classNames}, f)

print("Embeddings calculated and saved successfully.")
