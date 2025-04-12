import streamlit as st
import cv2
import numpy as np
import joblib
import json
from server.util import get_cropped_image_if_2_eyes
from server.wavelet import w2d

# Load models and class dictionary
with open("server/artifacts/class_dictionary.json", "r") as f:
    class_dict = json.load(f)
rev_class_dict = {v: k for k, v in class_dict.items()}
model = joblib.load("server/artifacts/svm_model.pkl")

st.title("Footballer Face Classifier")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Read image
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, 1)

    st.image(img, channels="BGR", caption="Uploaded Image")

    cropped_faces = get_cropped_image_if_2_eyes(img)

    if cropped_faces:
        for face in cropped_faces:
            scaled_raw_img = cv2.resize(face, (32, 32))
            img_har = w2d(face, 'db1', 5)
            scaled_img_har = cv2.resize(img_har, (32, 32))
            combined_img = np.vstack((scaled_raw_img.reshape(32*32*3, 1), scaled_img_har.reshape(32*32, 1)))
            final_input = combined_img.reshape(1, -1).astype(float)

            result = model.predict(final_input)[0]
            st.success(f"Prediction: {rev_class_dict[result]}")
    else:
        st.warning("No face with 2 eyes detected!")
