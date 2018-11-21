/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * A class that wraps webcam video elements to capture Tensor4Ds.
 */
export default class Webcam {
  /**
   * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the webcam feed.
   */
  constructor(webcamElement) {
    this.webcamElement = webcamElement;
  }

  /**
   * Captures a frame from the webcam and normalizes it between -1 and 1.
   * Returns a batched image (1-element batch) of shape [1, w, h, c].
   */
  capture() {
	var canvas = document.getElementById('webcam-canvas');
	
	const aspectRatio = this.webcamElement.width / this.webcamElement.height;
	if (this.webcamElement.width >= this.webcamElement.height) {
		canvas.width = aspectRatio * 224;
		canvas.height = 224;
	} else if (this.webcamElement.width < this.webcamElement.height) {
		canvas.width = 224;
		canvas.height = 224 / aspectRatio;
	}
	
	const croppedImage = this.cropImage(canvas);
	
	return croppedImage;
  }

  /**
   * Crops an image tensor so we get a square image with no white space.
   * @param {Tensor4D} img An input image Tensor to crop.
   */
  cropImage(img) {
    const size = Math.min(img.height, img.width);
    const centerHeight = img.height / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.width / 2;
    const beginWidth = centerWidth - (size / 2);
	var ctx = img.getContext("2d");
	ctx.drawImage(this.webcamElement,beginWidth,beginHeight,size,size,0,0,img.width,img.height);
	var croppedImage = img.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
	croppedImage = croppedImage.replace("data:image/octet-stream;base64,", "");

    return croppedImage;
  }

  /**
   * Adjusts the video size so we can make a centered square crop without
   * including whitespace.
   * @param {number} width The real width of the video element.
   * @param {number} height The real height of the video element.
   */
  adjustVideoSize(width, height) {
    const aspectRatio = width / height;
    if (width >= height) {
      this.webcamElement.width = aspectRatio * this.webcamElement.height;
    } else if (width < height) {
      this.webcamElement.height = this.webcamElement.width / aspectRatio;
    }
  }

  async setup(type) {
    if(type == "front") {
      return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
          navigator.getUserMedia(
              {video: true },
              stream => {
                this.webcamElement.srcObject = stream;
                this.webcamElement.addEventListener('loadeddata', async () => {
                  this.adjustVideoSize(
                      this.webcamElement.videoWidth,
                      this.webcamElement.videoHeight);
                  resolve();
                }, false);
              },
              error => {
                reject();
              });
        } else {
          reject();
        }
      });
    } else {
      return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
          navigator.getUserMedia(
              {video: { facingMode: { exact: "environment" }} },
              stream => {
                this.webcamElement.srcObject = stream;
                this.webcamElement.addEventListener('loadeddata', async () => {
                  this.adjustVideoSize(
                      this.webcamElement.videoWidth,
                      this.webcamElement.videoHeight);
                  resolve();
                }, false);
              },
              error => {
                reject();
              });
        } else {
          reject();
        }
      });
    } 
  }
};
