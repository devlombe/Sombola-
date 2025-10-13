import diseaseService from "./diseaseService";
import type { PredictionResult, SeverityLevel } from "../types";

// Import TensorFlow.js
declare global {
  interface Window {
    tf: any;
  }
}

class MLService {
  private labels: string[] = [];
  private isInitialized = false;
  private model: any = null;

  public async initialize(): Promise<void> {
    console.log("MLService initialize called");
    if (this.isInitialized) {
      console.log("MLService already initialized");
      return;
    }
    try {
      // Load TensorFlow.js
      if (!window.tf) {
        console.log("Loading TensorFlow.js...");
        await this.loadTensorFlowJS();
      } else {
        console.log("TensorFlow.js already loaded");
      }

      console.log("Loading model...");
      await this.loadModel();
      console.log("MLService initialization complete");
    } catch (error) {
      console.error("Error initializing MLService:", error);
      this.isInitialized = false;
    }
  }

  private async loadTensorFlowJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";
      script.onload = () => {
        console.log("TensorFlow.js loaded successfully");
        resolve();
      };
      script.onerror = () => {
        console.error("Failed to load TensorFlow.js");
        reject(new Error("Failed to load TensorFlow.js"));
      };
      document.head.appendChild(script);
    });
  }

  private async loadModel(): Promise<void> {
    try {
      // Load labels
      const response = await fetch("/model/labels.txt");
      if (!response.ok) {
        throw new Error("Failed to load labels.txt");
      }
      const text = await response.text();
      this.labels = text.split("\n").filter((label) => label.trim() !== "");

      // Load real TensorFlow.js model
      this.model = await window.tf.loadGraphModel("/model/model.json");
      console.log("Loaded TensorFlow.js model from /model/model.json");

      // Initialize disease service
      await diseaseService.initialize();

      this.isInitialized = true;
      console.log("MLService and DiseaseService initialized successfully.");
    } catch (error) {
      console.error("Error loading model:", error);
      this.isInitialized = false;
    }
  }

  private createMockModel() {
    // Create a mock model that returns random predictions
    // This is a temporary fallback until we can properly load the TFLite model
    return {
      predict: (input: any) => {
        // Return a mock prediction tensor
        const mockPredictions = new Array(this.labels.length)
          .fill(0)
          .map(() => Math.random());
        const sum = mockPredictions.reduce((a, b) => a + b, 0);
        const normalizedPredictions = mockPredictions.map((p) => p / sum);

        return {
          data: () => Promise.resolve(normalizedPredictions),
          dispose: () => {},
        };
      },
    };
  }

  public async predict(imagePath: string): Promise<PredictionResult> {
    console.log("Predict called with:", {
      isInitialized: this.isInitialized,
      hasModel: !!this.model,
    });

    if (!this.isInitialized) {
      throw new Error("MLService not initialized");
    }

    if (!this.model) {
      throw new Error("Model not loaded");
    }

    try {
      // Preprocess image
      const imageTensor = await this.preprocessImage(imagePath);

      // Run inference
      const predictions = this.model.predict(imageTensor);
      const probabilities = await predictions.data();

      // Get top prediction
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const predictedLabel = this.labels[maxIndex];
      const confidence = probabilities[maxIndex]; // Keep for backward compatibility

      // Clean up tensors
      imageTensor.dispose();
      predictions.dispose();

      // Enhanced confidence checking with multi-prediction analysis
      const TOP_PREDICTIONS = Array.from(probabilities)
        .map((p, i) => ({ label: this.labels[i], confidence: p as number }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      // Add safety checks for array access
      if (TOP_PREDICTIONS.length < 2) {
        throw new Error("Insufficient predictions from model");
      }

      const topConfidence = TOP_PREDICTIONS[0].confidence;
      const secondConfidence = TOP_PREDICTIONS[1].confidence;
      const confidenceGap = topConfidence - secondConfidence;

      // Debug log with enhanced information
      console.log("[MLService] Enhanced prediction analysis:", {
        predictedLabel,
        topConfidence: (topConfidence * 100).toFixed(1) + "%",
        secondConfidence: (secondConfidence * 100).toFixed(1) + "%",
        confidenceGap: (confidenceGap * 100).toFixed(1) + "%",
        topPredictions: TOP_PREDICTIONS.map((p) => ({
          label: p.label,
          confidence: (p.confidence * 100).toFixed(1) + "%",
        })),
      });

      // Helper to extract plant type from a label string
      const getPlantType = (label: string) => {
        if (label.includes("___")) return label.split("___")[0];
        if (label.includes("__")) return label.split("__")[0];
        return label.split("_")[0];
      };

      // --- VALIDATION CHECKS ---

      // 1. Check for out-of-distribution images (e.g., selfies, non-leaf objects).
      // If the model's top predictions are for completely different plants, it's highly
      // uncertain and likely not looking at a supported leaf.
      if (TOP_PREDICTIONS.length >= 3) {
        const topPlantType = getPlantType(TOP_PREDICTIONS[0].label);
        const secondPlantType = getPlantType(TOP_PREDICTIONS[1].label);
        const thirdPlantType = getPlantType(TOP_PREDICTIONS[2].label);

        if (
          topPlantType !== secondPlantType &&
          secondPlantType !== thirdPlantType &&
          topPlantType !== thirdPlantType
        ) {
          const supportedPlantTypes = this.labels
            .map((l) => getPlantType(l))
            .filter((v, i, a) => a.indexOf(v) === i);
          const rejectionReason = `Image cannot be classified. It does not appear to be a supported plant leaf.`;

          console.log(
            "[MLService] Prediction rejected due to high plant type variance:",
            {
              topPredictions: TOP_PREDICTIONS.map((p) => ({
                plant: getPlantType(p.label),
                confidence: (p.confidence * 100).toFixed(1) + "%",
              })),
            },
          );

          throw new Error(
            `${rejectionReason} Please use a clear photo of a leaf from a supported plant: ${supportedPlantTypes.join(", ")}.`,
          );
        }
      }

      // 2. Check for misclassification of healthy leaves from unsupported plants.
      // This handles cases where the model confidently misclassifies a leaf from an
      // unsupported plant as a healthy leaf of a supported plant.
      const topPrediction = TOP_PREDICTIONS[0];
      const isTopPredictionHealthy = topPrediction.label
        .toLowerCase()
        .includes("healthy");

      // 3. Stricter check for 'healthy' predictions to avoid false positives on non-plant images.
      // If the model predicts a leaf is healthy, we require a much higher confidence
      // to be sure it's not misclassifying an out-of-distribution image (like a selfie).
      if (isTopPredictionHealthy) {
        const HEALTHY_CONFIDENCE_THRESHOLD = 0.85; // Must be very confident it's healthy
        const HEALTHY_CONFIDENCE_GAP = 0.5; // Must be a clear winner over any disease
        if (
          topConfidence < HEALTHY_CONFIDENCE_THRESHOLD ||
          confidenceGap < HEALTHY_CONFIDENCE_GAP
        ) {
          const rejectionReason = `Uncertain 'healthy' prediction`;
          console.log(
            "[MLService] Prediction rejected due to uncertain 'healthy' classification:",
            {
              reason: rejectionReason,
              topConfidence: (topConfidence * 100).toFixed(1) + "%",
              confidenceGap: (confidenceGap * 100).toFixed(1) + "%",
            },
          );
          throw new Error(
            `${rejectionReason}. The image may not be a clear photo of a supported plant leaf. Please try again.`,
          );
        }
      }

      if (isTopPredictionHealthy) {
        const topPlantType = getPlantType(topPrediction.label);
        const secondPlantType = getPlantType(TOP_PREDICTIONS[1].label);

        // If the top prediction is healthy, but the second is a *different* plant,
        // it's a strong sign of an out-of-distribution image.
        if (topPlantType !== secondPlantType) {
          const supportedPlantTypes = this.labels
            .map((l) => getPlantType(l))
            .filter((v, i, a) => a.indexOf(v) === i);
          const rejectionReason = `Uncertain plant type: The model's top predictions are for different plants (${topPlantType} vs. ${secondPlantType})`;

          console.log(
            "[MLService] Prediction rejected due to plant type uncertainty:",
            {
              topPrediction: `${topPrediction.label} (${(topPrediction.confidence * 100).toFixed(1)}%)`,
              secondPrediction: `${TOP_PREDICTIONS[1].label} (${(TOP_PREDICTIONS[1].confidence * 100).toFixed(1)}%)`,
            },
          );

          throw new Error(
            `${rejectionReason}. This could mean the image is of an unsupported plant. ` +
              `Supported plants are: ${supportedPlantTypes.join(", ")}. ` +
              `Please use a clear photo of a leaf from a supported plant.`,
          );
        }
      }

      // 3. General confidence and uncertainty check.
      // This rejects predictions that are either not confident enough or too close to call.
      const CONFIDENCE_THRESHOLD = 0.5; // Increased for better accuracy
      const MIN_CONFIDENCE_GAP = 0.15;

      if (
        topConfidence < CONFIDENCE_THRESHOLD ||
        confidenceGap < MIN_CONFIDENCE_GAP
      ) {
        const supportedPlantTypes = this.labels
          .map((l) => getPlantType(l))
          .filter((v, i, a) => a.indexOf(v) === i);
        let rejectionReason = "";
        if (topConfidence < CONFIDENCE_THRESHOLD) {
          rejectionReason = `Low confidence prediction (${(topConfidence * 100).toFixed(1)}%)`;
        } else {
          rejectionReason = `Uncertain prediction - top predictions too close (gap: ${(confidenceGap * 100).toFixed(1)}%)`;
        }

        console.log(
          "[MLService] Prediction rejected due to low confidence/gap:",
          {
            reason: rejectionReason,
            topConfidence: (topConfidence * 100).toFixed(1) + "%",
            confidenceGap: (confidenceGap * 100).toFixed(1) + "%",
          },
        );

        throw new Error(
          `${rejectionReason}. This image may not be a supported plant type or the quality may be too low. ` +
            `Supported plants: ${supportedPlantTypes.join(", ")}. ` +
            `Please ensure you're photographing a clear leaf from one of these plant types.`,
        );
      }

      const diseaseInfo = diseaseService.getDiseaseInfo(predictedLabel);
      if (!diseaseInfo) {
        throw new Error(`No disease info found for label: ${predictedLabel}`);
      }

      // Extract plant type (crop name) - handle different label formats
      let plantType: string;
      if (predictedLabel.includes("___")) {
        plantType = predictedLabel.split("___")[0];
      } else if (predictedLabel.includes("__")) {
        plantType = predictedLabel.split("__")[0];
      } else {
        plantType = predictedLabel.split("_")[0];
      }

      // Check if healthy - handle different healthy label formats
      const isHealthy =
        predictedLabel.toLowerCase().includes("healthy") ||
        predictedLabel.toLowerCase().includes("_healthy");

      let severityLevel: SeverityLevel;
      if (isHealthy) {
        severityLevel = "Healthy" as SeverityLevel.Healthy;
      } else if (topConfidence > 0.9) {
        severityLevel = "Severe" as SeverityLevel.Severe;
      } else if (topConfidence > 0.8) {
        severityLevel = "Moderate" as SeverityLevel.Moderate;
      } else {
        severityLevel = "Mild" as SeverityLevel.Mild;
      }

      return {
        label: predictedLabel,
        confidence: topConfidence,
        diseaseInfo,
        timestamp: Date.now(),
        imagePath,
        plantType,
        plantName: plantType, // Add plantName for analysis display
        isHealthy,
        confidencePercentage: `${(topConfidence * 100).toFixed(1)}%`,
        severityLevel,
      };
    } catch (error) {
      console.error("Prediction error:", error);
      throw new Error(
        `Prediction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async preprocessImage(imagePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Resize to 256x256
          canvas.width = 256;
          canvas.height = 256;

          // Draw and resize image
          ctx?.drawImage(img, 0, 0, 256, 256);

          // Get image data
          const imageData = ctx?.getImageData(0, 0, 256, 256);
          if (!imageData) {
            reject(new Error("Failed to get image data"));
            return;
          }

          // Convert to tensor and normalize to [0,1]
          const pixels = imageData.data;
          const normalizedPixels = [];

          for (let i = 0; i < pixels.length; i += 4) {
            normalizedPixels.push(pixels[i] / 255); // R
            normalizedPixels.push(pixels[i + 1] / 255); // G
            normalizedPixels.push(pixels[i + 2] / 255); // B
          }

          // Create tensor with shape [1, 256, 256, 3]
          const tensor = window.tf.tensor4d(normalizedPixels, [1, 256, 256, 3]);
          resolve(tensor);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imagePath;
    });
  }
}

const mlService = new MLService();
export default mlService;
