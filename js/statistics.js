function generateDeck(){
	var cardValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
	// We create a lookup array for card names, same length as card values
	var cardNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "K", "Q", "J"];
	var suits = ['H', 'C', 'D', 'S'];

	var cardDeck = [];

	for (var i = 0; i < suits.length; i++) {
		for (var j = 0; j < cardValues.length; j++){
			cardName = suits[i]+cardNames[j];
			cardValue = cardValues[j];
			cardDeck.push([cardName, cardValue]);
		}
	};
	return cardDeck;
}

function sumCards(cardArray){
	var sum = 0;

	for (var i = 0; i < cardArray.length; i++) {
		sum += cardArray[i][1];
	};

	return sum;
};

function sampleCards(sampleSize, cardDeck){
	/* 
	sampleSize: integer value between 1 and size of deck 
	cardDeck: card deck array created by generateDeck, format: [["HA", 1], ["H2", 2] ... ["SJ", 10]]

	returns: Sample of size `sampleSize` from `cardDeck`, format: [["H3", 3], ["D4", 4]]
	*/
	cardSamples = [];

	for (var i = 0; i < sampleSize; i++) {
			var randomInt = getRandomInt(0, cardDeck.length-i);
			var card = cardDeck[randomInt];
			cardSamples.push(card);
			// switch position of cards, selected cards go to the end of deck
			cardDeck[randomInt] = cardDeck[cardDeck.length-1-i];
			cardDeck[cardDeck.length-1-i] = card;
		};	

	return cardSamples;

};

function getSampleValues(numberCards, sampleSize, deck){
		
	var generatedSamples = [];

	for (var i = 0; i < sampleSize; i++) {
		var sample = sampleCards(numberCards, deck); 
		// console.log(sample);
		var sumOfSample = sumCards(sample);
		console.log(sumOfSample);
		generatedSamples.push(sumOfSample);
	};
	return generatedSamples;
}

// Statistics

function average(sampleArray){
	var sumOfValues = 0;

	for (var i = 0; i < sampleArray.length; i++) {
		sumOfValues += sampleArray[i];
	};

	var average = sumOfValues / sampleArray.length;

	return average;
}

function median(sampleArray){
	sampleArray.sort(compareNumbers);
	var median = 0;

	if (sampleArray.length % 2 === 0) {
		var center1 = sampleArray[sampleArray.length/2 - 1];
		var center2 = sampleArray[sampleArray.length/2];
		median = (center1+center2)/2;

	} else{
		median  = sampleArray[Math.floor(sampleArray.length/2)];
	};

	return median;
}

function mode(sampleArray){
	// most frequently occurring value in array
}

function deviation(sampleArray){
	// distance between a given array value and array mean
	var mean = average(sampleArray);
	var deviations = []

	for (var i = 0; i < sampleArray.length; i++) {
		deviations.push(sampleArray[i]-mean);
	}

	return deviations;
}

function variance(sampleArray, bessel = false){
	// sum of SQUARED deviations divided by n (length of array) 
	// or mean of squared deviations

	var sumOfSquares = 0;
	var deviations = deviation(sampleArray);

	for (var i = 0; i < deviations.length; i++) {
		sumOfSquares += deviations[i]*deviations[i];
	}

	var nSamples = bessel ? deviations.length - 1 : deviations.length;

	return sumOfSquares / nSamples;

}

function stdDeviation(sampleArray, corrected = false){
	// sqrt of variance
	// corrected = true is Bessel's correction
	return Math.sqrt(variance(sampleArray, corrected));
}

function calculate(){
	/*
	Top level function called from the html "input"
	will coordinate other functions to generate results
	*/
	var deck = generateDeck();

	var numberCards = document.getElementById("card_sample").value;
	var sampleSize = document.getElementById("sample_size").value;

	var generatedSamples = getSampleValues(numberCards, sampleSize, deck);
	console.log(generatedSamples);

	var averageOfSamples = average(generatedSamples);
	console.log(averageOfSamples);

	var standardDev = stdDeviation(generatedSamples);
	console.log(standardDev);

	var correctedStdDev = stdDeviation(generatedSamples, true);
	console.log(correctedStdDev);

	drawHistogram(generatedSamples, 15);

	console.log(median([1, 9, 6, 4, 15]));
	 
};

// Auxiliary functions go HERE

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function compareNumbers(a, b) {
    return a - b;
}


function drawHistogram(samples, binsize){

	var data = samples;

	var formatCount = d3.format(",.0f");

	var margin = {top: 10, right: 30, bottom: 30, left: 30},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	// change domain to be dynamic, based on the array values (samples)
	//var x = d3.scaleLinear().domain([0, (d3.max(data) + binsize) - ((d3.max(data) + binsize) % binsize) ])
    //.rangeRound([0, width]);
    var x = d3.scaleLinear().domain([0, 30])
    .rangeRound([0, width]);

	// change domain to be dynamic, based on the array values (samples)
	// change thresholds to be dynamic
	var bins = d3.histogram()
    .domain([0, 30])
    .thresholds(binsize)
    (data);


	var y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) { return d.length; })])
    .range([height, 0]);

    // make this only generate one histogram - always override one element/use the same element
	var svg = d3.select("div.histogram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var bar = svg.selectAll(".bar")
    .data(bins)
  	.enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
    .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.length); });

	svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

}




/*
cardDeck = [
  ["H1", 1],
  ["H2", 2],
  ["H3", 3],
  ...
]
card = ["D5", 5]
cardName = card[0]
cardValue = card[1]

*/

