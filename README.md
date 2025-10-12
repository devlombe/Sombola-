**Prerequisites:** Node.js
### Overview

This project is a plant disease detection application built with React and TypeScript. It uses a machine learning model running in the browser with TensorFlow.js to analyze images of plants and identify potential diseases.

### Key Technologies

*   **Frontend:** React, TypeScript, Vite
*   **Machine Learning:** TensorFlow.js
*   **Styling:** The classes in `App.tsx`  are using **Tailwind CSS**.

### Project Structure

*   `components/`: Contains reusable UI components like cards, headers, and indicators.
*   `screens/`: Represents the different pages of the application, such as the home screen, camera screen, and results screen.
*   `services/`: Contains the core logic of the application.
    *   `mlService.ts`: Handles loading the TensorFlow.js model and running predictions on images.
    *   `diseaseService.ts`: Manages the data related to plant diseases.
*   `public/model/`: This directory contains the machine learning model files, including the model itself (`model.json`, `*.bin`), the labels (`labels.txt`), and disease information (`disease_info_by_label.json`).
*   `providers/`: Contains the `DiseaseProvider`, which makes disease-related data available to the entire application using React's Context API.

### How it Works

1.  The application loads a pre-trained TensorFlow.js model and disease information when it starts.
2.  The user can either take a picture with their camera or upload an image from their gallery.
3.  The `mlService` preprocesses the image to the required size (256x256) and format.
4.  The preprocessed image is fed to the TensorFlow.js model for inference.
5.  The model returns a prediction, which includes the predicted disease label and a confidence score.
6.  The application uses the predicted label to retrieve detailed information about the disease from the `diseaseService`.
7.  The results, including the disease name, confidence, and other information, are displayed to the user.

### Getting Started

1.  **Install Dependencies:** Run `npm install` in your terminal.
2.  **Run the Application:** Run `npm run dev` to start the development server.
