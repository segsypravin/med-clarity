import tensorflow as tf
import cv2
import numpy as np

IMG_SIZE = 224

model = tf.keras.models.load_model("xray_model.h5")

classes = ["bacterial", "normal", "viral"]

def predict_image(image_path):

    img = cv2.imread(image_path)
    img = cv2.resize(img,(IMG_SIZE,IMG_SIZE))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img)

    class_index = np.argmax(prediction)

    return classes[class_index], float(np.max(prediction))