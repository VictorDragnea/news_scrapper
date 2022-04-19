// Imports
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helpers = require('./public/js/helpers');
const PORT = 8000;
const RESULTS_LIMIT = 50;

const app = express();

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

app.post('/generate-report', async (req, res) => {
	let keywords = [];
	let results = [];
	let keywordsSearchString = '';

	if (req.body.keywordList) {
		keywords = req.body.keywordList.split('\r\n');
		// console.log('keywords', keywords);
		keywordsSearchString = keywords.join(' OR ');

		console.log(keywordsSearchString);
	}

	for (let i = 0; i < keywords.length; i++) {
		const keyword = keywords[i];

		var googleSearchUrl = `https://www.google.com/search?q=${keyword}&tbm=nws&tbs=qdr:d,lang_1ro&lr=lang_ro&sa=X&num=${RESULTS_LIMIT}`;

		console.log('googleSearchUrl', googleSearchUrl);

		await helpers
			.getGoogleNewsHeadlines(googleSearchUrl)
			.then((response) => {
				// console.log('response', response);

				helpers.getArticlesFromHeadlines(response).then((data) => {
					// console.log('data', data);

					results.push(data);
					// helpers.writeToDocument(data);
				});
			});
	}

	helpers.writeArticleToWordDocument(results);
	res.json(results);
});

app.listen(PORT, () => console.info(`Server running on port ${PORT}`));
