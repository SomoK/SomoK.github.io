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

import Webcam from './webcam.js';

// import {ControllerDataset} from './controller_dataset';
// const controllerDataset = new ControllerDataset(NUM_CLASSES);

const webcam = new Webcam(document.getElementById('webcam'));
const result = document.getElementById('result');

let isPredicting = false;

const result_array = ['NARCISO RODRIGUEZ FOR HER', 'NARCISO EAU DE PARFUM POUDÉE', 'NARCISO RODRIGUEZ FOR HIM', 'NONE'];

async function predict() {
    console.log("start Predict");
    result.innerText = "Start Predicting...";
    while (isPredicting) {
        const img = webcam.capture();
		console.log(img);
		const request = {
			"requests":[
			  {
				"image":{ "content": img },
				"features":[
				  {
					"type":"LABEL_DETECTION",
					"maxResults":5
				  },
				  {
					"type":"DOCUMENT_TEXT_DETECTION"
				  }
				]
			  }
			]
		};
		console.log(request);
		var visionApiRequest = new XMLHttpRequest;

		visionApiRequest.onload = function(){
			const data = JSON.parse(visionApiRequest.responseText);
			var labels = data.responses[0].labelAnnotations;
			var perfumeDetected = false;
			labels.forEach(function(label) {
				console.log(label.description);
				if (label.description == 'perfume' || label.description == 'product')
				{
					var texts = data.responses[0].textAnnotations[0].description.toUpperCase().replace(/\n/g, " ");
					console.log('texts: ' + texts);
					var detectedProduct = searchProducts(texts);
					perfumeDetected = true;
					return true;
				}
			});
			if (!perfumeDetected)
			{
				result.innerText = "NONE";
			}
		};
		visionApiRequest.open("POST","https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAtuu3UDpiJqY_uWBSerugsZoXX-IyFS98",!0);
		visionApiRequest.send(JSON.stringify(request));
		isPredicting = false;
    }
}

async function searchProducts(inputText) {
	var products = ["NARCISO", "NARCISO EAU DE PARFUM POUDRÉE", "NARCISO RODRIGUEZ FOR HER", "FOR HIM NARCISO RODRIGUEZ"];
	var detectedProduct = "";
	for (var i = 0; i < products.length; i++)
	{
		if (inputText.includes(products[i]) && (products[i].length > detectedProduct.length))
		{
			if (i == 3)
			{
				detectedProduct = "NARCISO RODRIGUEZ FOR HIM"
			}
			else
			{
				detectedProduct = products[i];
			}
		}
	}
	if (detectedProduct == "")
	{
		result.innerText = "NONE";
	}
	else
	{
		result.innerText = detectedProduct;
	}
	return detectedProduct;
}

async function init() {
  try {
    await webcam.setup("else");
  } catch (e) {
    await webcam.setup("front");
  }

  console.log("initialized");
  document.getElementById('overlay').addEventListener('click', async () => {
    isPredicting = true;
	console.log("clicked");
    predict();
  });
  
}

init();
