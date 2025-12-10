Chapter 3: Methodology**

This chapter details the technical methodology employed in the design, development, and implementation of the Sombola system. It outlines the research design, deconstructs the system architecture, and provides a comprehensive explanation of the data processing workflow, model inference mechanism, state management strategies, and the offline-first approach that ensures the application's robustness.

#### **3.1 Research Design: Design Science and Prototyping**

The research methodology for this project is founded on the principles of **Design Science**. This approach is centered on the creation and evaluation of a functional artifact to solve a real-world problem. In this context, the artifact is the Sombola progressive web application. The core of the methodology involves an iterative cycle of building, refining, and evaluating the prototype.

The process began with identifying the practical need for an accessible, on-device tool for plant disease identification. A prototype was then constructed to address this need, integrating a machine learning model into a user-friendly mobile interface. Each feature, from image capture to the display of results, was iteratively developed and tested. The evaluation of this artifact—its accuracy, usability, and performance—provides the primary data for this research, demonstrating a tangible solution to the identified problem.

#### **3.2 System Architecture Deconstruction**

The Sombola system is engineered using a modern, three-layer architecture to ensure a clear separation of concerns, making the application scalable, maintainable, and robust. The three distinct layers are the Presentation Layer (UI), the Logic Layer (Business Logic), and the Data Layer.

*   **Presentation Layer (UI):** This is the user-facing part of the application, responsible for rendering the interface and capturing user interactions. It is built with React and TypeScript, utilizing components to create a modular and consistent user experience. Key components in this layer include:
    *   **Screens (`/screens`):** Components that define the structure of each main view, such as `HomeScreen.tsx`, `CameraScreen.tsx`, and `ResultScreen.tsx`.
    *   **Reusable Components (`/components`):** Atomic UI elements like `Header.tsx`, `ActionCard.tsx`, and `DiseaseCard.tsx` that are used across multiple screens to maintain a consistent design language.
    *   **Application Entrypoint (`App.tsx`, `index.tsx`):** The root of the React application where providers and navigation are set up.

*   **Logic Layer (Business Logic):** This layer acts as the brain of the application, handling the core functionality, data processing, and state management. It is decoupled from the UI, meaning the same logic could be used with a different presentation layer.
    *   **Services (`/services`):**
        *   `mlService.ts`: The core of the analysis engine. It manages the loading of the TensorFlow.js model, preprocesses user images, runs inference, and implements a series of crucial validation checks to ensure the reliability of predictions.
        *   `diseaseService.ts`: Manages the retrieval of detailed disease information from the data layer and handles the logic for managing prediction history.
    *   **State Providers (`/providers`):**
        *   `DiseaseProvider.tsx`: Utilizes React's Context API to create a global state container. It holds the application's state, such as the current prediction result and historical analysis data, making it accessible throughout the component tree without "prop drilling."

*   **Data Layer:** This layer is responsible for providing and persisting data. In Sombola, this layer is designed to work entirely on the client-side.
    *   **ML Model Assets (`/public/model`):** Contains the pre-trained TensorFlow.js model (`model.json`, `.bin` shards), labels (`labels.txt`), and the static disease information database (`disease_info_by_label.json`). These assets are bundled with the application.
    *   **Browser Storage:** The application uses the browser's Local Storage or IndexedDB (managed via `diseaseService.ts`) to persist user data, such as their analysis history, ensuring that past results are available across sessions.

*[Placeholder for Figure 1: A diagram illustrating the three-layer architecture, showing the flow of data from the UI through the Logic Layer to the Data Layer.]*

*[Placeholder for Figure 2: A component diagram showing the relationship between key components like CameraScreen, MLService, and DiseaseProvider.]*

#### **3.3 Data and Image Pre-processing Workflow**

The accuracy of the machine learning model is highly dependent on the quality and format of the input data. The pre-processing workflow in Sombola is handled entirely within `mlService.ts` and is designed to transform user-provided images into a standardized format that the TensorFlow.js model can understand.

1.  **Image Acquisition:** The user initiates the process through one of two methods on the UI layer:
    *   **Camera API (`CameraScreen.tsx`):** The application requests access to the device's camera, allowing the user to capture a live image of a plant leaf.
    *   **Gallery Integration (`GalleryScreen.tsx`):** The user can select an existing image from their device's photo library.

2.  **Image Pre-processing:** Once an image is acquired (as a URI or Blob), it is passed to the `preprocessImage` function in `mlService.ts`. This function executes a series of critical transformations:
    *   **Resizing:** The input image is uniformly resized to a 256x256 pixel square. This standardization is crucial because the machine learning model was trained on images of this specific dimension.
    *   **Normalization:** The pixel values of the image, which are typically in an RGB format with values from 0 to 255, are normalized to a range of 0 to 1. This is achieved by dividing each pixel's value by 255. Normalization helps the model converge faster and perform more reliably.
    *   **Tensor Conversion:** The normalized pixel data is converted into a 4-dimensional tensor with the shape `[1, 256, 256, 3]`. This format is the required input shape for the TensorFlow.js model, representing a single batch of one image with a height of 256, a width of 256, and 3 color channels (RGB).

*[Placeholder for Figure 5: A workflow diagram illustrating the image pre-processing pipeline, from acquisition to the final tensor.]*

#### **3.4 Local Model Inference and Validation**

Unlike systems that rely on cloud-based AI services, Sombola uses a client-side inference mechanism powered by TensorFlow.js. This approach enhances privacy, reduces latency, and enables full offline functionality.

*   **Core Logic of `mlService.ts`:**
    *   **Model Loading:** Upon application startup, the `initialize` method in `mlService` loads the pre-trained TensorFlow.js graph model from the `/public/model` directory. This model is bundled with the application's static assets.
    *   **Inference:** The `predict` function takes the pre-processed image tensor and passes it to the `model.predict()` method. This runs the model entirely within the user's browser, which returns a tensor containing an array of probabilities—one for each possible disease label.
    *   **Post-Inference Validation:** A simple prediction is often not reliable enough. To prevent misclassifications, a multi-stage validation logic was implemented:
        1.  **Out-of-Distribution Check:** The system analyzes the top three predictions. If they belong to three different plant types, it concludes the model is uncertain and rejects the prediction, preventing incorrect classifications of non-plant objects.
        2.  **General Confidence Check:** It enforces a minimum confidence threshold for the top prediction and a minimum confidence gap between the first and second predictions. This filters out results where the model is not sufficiently confident.
        3.  **Stricter "Healthy" Check:** Based on empirical testing, a special, more stringent check was added for "healthy" predictions. To classify an image as healthy, the model must have a much higher confidence (e.g., >85%) and a wider gap to the next prediction. This effectively prevents the common failure mode of misclassifying random objects (like a selfie) as a healthy leaf.

*   **Table 1: Description of Model Validation Parameters**

| Parameter                    | Value | Role                                                                                                                            |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| `CONFIDENCE_THRESHOLD`       | 0.50  | The minimum confidence score (50%) required for any top prediction to be considered valid.                                        |
| `MIN_CONFIDENCE_GAP`         | 0.15  | The top prediction must be at least 15 percentage points more confident than the second prediction to avoid ambiguity.            |
| `HEALTHY_CONFIDENCE_THRESHOLD` | 0.85  | A stricter threshold (85%) applied only when the top prediction is "healthy" to prevent false positives on non-plant images. |
| `HEALTHY_CONFIDENCE_GAP`     | 0.50  | A much larger gap (50%) required for "healthy" predictions to ensure the model is exceptionally certain.                         |

#### **3.5 State Management and Data Persistence**

To manage data flow and maintain state across the application, Sombola employs a combination of React's Context API for in-memory state and browser storage for persistence.

*   **`DiseaseProvider.tsx` (React Context):** This provider serves as a centralized store for global application state. It wraps the entire component tree and exposes a context that includes the current image being analyzed, the final prediction result, and the user's complete analysis history. This approach avoids the complexity of passing props through many layers of components and allows any component to access or update the state in a structured manner.

*   **`diseaseService.ts` (Data Persistence):** This service abstracts the logic for data handling. It is responsible for fetching the detailed disease information from the `disease_info_by_label.json` file. Furthermore, it contains the logic to interact with the browser's **Local Storage**. When a new analysis is completed, the result is saved to the user's history array, which is then persisted in Local Storage, ensuring that the user's data is retained between sessions.

#### **3.6 Offline Functionality Implementation**

A key requirement for Sombola was robust offline capability, as users in the field may not have reliable internet access. The system was designed from the ground up with an offline-first architecture.

The core of this functionality lies in the choice to use **TensorFlow.js**. The pre-trained machine learning model and all associated metadata (labels and disease information JSON) are included as part of the application's initial download. When the user loads the web application for the first time with an internet connection, all necessary assets are cached on the device.

Subsequently, every core feature—capturing an image, pre-processing it, running the model inference, and retrieving disease information—is executed entirely on the user's device. This design choice ensures that the application is not merely functional but is highly reliable and performant in offline environments, directly serving the needs of its target users.