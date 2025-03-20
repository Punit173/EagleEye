import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

export class WeaponDetectionModel {
  constructor() {
    this.model = null;
    this.classes = [
      'knife',
      'gun',
      'rifle',
      'pistol',
      'sword',
      'scissors',
      'baseball_bat',
      'golf_club',
      'hammer',
      'wrench',
      'bottle',
      'chair',
      'table',
      'laptop',
      'keyboard'
    ];
    this.numClasses = this.classes.length;
    this.inputShape = [224, 224, 3];
  }

  async buildModel() {
    // Create a CNN model
    this.model = tf.sequential();

    // First convolutional block
    this.model.add(tf.layers.conv2d({
      inputShape: this.inputShape,
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    this.model.add(tf.layers.batchNormalization());
    this.model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Second convolutional block
    this.model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    this.model.add(tf.layers.batchNormalization());
    this.model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Third convolutional block
    this.model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    this.model.add(tf.layers.batchNormalization());
    this.model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Flatten and dense layers
    this.model.add(tf.layers.flatten());
    this.model.add(tf.layers.dense({ units: 512, activation: 'relu' }));
    this.model.add(tf.layers.dropout({ rate: 0.5 }));
    this.model.add(tf.layers.dense({ units: this.numClasses, activation: 'softmax' }));

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return this.model;
  }

  async trainModel(trainData, trainLabels, epochs = 50) {
    const history = await this.model.fit(trainData, trainLabels, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1} of ${epochs}`);
          console.log(`Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
        }
      }
    });

    // Visualize training results
    await this.visualizeTraining(history);
    return history;
  }

  async visualizeTraining(history) {
    const lossPlot = document.createElement('div');
    const accuracyPlot = document.createElement('div');
    
    await tfvis.show.history({
      name: 'Training History',
      tab: 'Training',
    }, history, ['loss', 'acc']);
  }

  async predict(imageData) {
    // Preprocess the image
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor(this.inputShape)
      .toFloat()
      .expandDims();
    
    // Normalize the image
    const normalized = tensor.div(255.0);
    
    // Make prediction
    const prediction = await this.model.predict(normalized).data();
    
    // Get top 3 predictions
    const top3 = Array.from(prediction)
      .map((prob, index) => ({
        class: this.classes[index],
        probability: prob
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    // Cleanup
    tensor.dispose();
    normalized.dispose();

    return top3;
  }

  async saveModel() {
    await this.model.save('indexeddb://weapon-detection-model');
    console.log('Model saved successfully');
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('indexeddb://weapon-detection-model');
      console.log('Model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }
} 